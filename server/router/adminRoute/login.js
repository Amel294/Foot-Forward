const express = require("express");
const router = express.Router();
const Admin = require("../../model/adminDB")
router.get('/login', (req, res) => {
    res.render('admin_login');
});

router.get('/:email', async (req, res) => {
    const email = req.params.email;
    console.log(email)
    try {
        // Find the admin by email
        const admin = await Admin.findOne({ email });
        console.log(admin)
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        // If admin is found, send it as a response
        res.status(200).json(admin);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/createAdmin', async (req, res) => {
    // Get the data from the request body
    const { email, password } = req.body;

    try {
        // Create a new admin instance
        const admin = new Admin({
            email,
            password
        });

        // Save the admin data to the database
        const savedAdmin = await admin.save();

        // Respond with the saved admin data
        res.status(200).json(savedAdmin);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});




// Login route
router.post('/loginAdmin', async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);

    try {
        // Find the admin by email
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Check if the provided password matches the stored password
        if (admin.password !== password) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        // Create a session for the admin upon successful login
        req.session.admin = admin;
        
        
        // Successful login
        res.status(200).json({ message: 'Login successful', admin });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;
