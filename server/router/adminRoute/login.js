const express = require("express");
const router = express.Router();
const Admin = require("../../model/adminDB")
router.get('/login', (req, res) => {
    if(req.session.admin){
        res.redirect('dashboard')
    }else{
        res.render('admin_login');

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
        req.session.admin = {
            id: admin._id, // You can store any user-related data here
            email: admin.email,
            // Add any other user data you want to store in the session
          };
        
        // Successful login
        res.redirect('dashboard')
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/adminLogout', (req, res) => {
    // Destroy the session
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Internal server error');
        }
        // Redirect the user to the login page or any other page
        res.redirect('/admin/login');
    });
});

module.exports = router;
