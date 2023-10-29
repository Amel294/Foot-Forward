const express = require("express");
const router = express.Router();
const User = require("../../model/userDB");
const { render } = require("ejs");

// Route to get all users
router.get('/allUsers', async (req, res) => {
    try {
        const users = await User.find(); // Retrieve all users from the database
        res.json(users); // Send the users as a JSON response
        console.log(users)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// Route for rendering the customers with user data
router.get('/customers', async (req, res) => {
    try {
        const users = await User.find(); // Retrieve all users from the database
        console.log(users)
        // Define the pageUrl function
        const pageUrl = (pageNumber) => {
            // Calculate the URL for the given page number
            const baseUrl = '/customers'; // Change this to your actual base URL
            return `${baseUrl}?page=1`;
        };

        res.render('customers', {
            users: users, // Pass the user data to the view
            activeRoute: 'customers',
            currentPage:1,
            totalPages:10,
            pageUrl:pageUrl,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Define a route to toggle the isActive property
router.post('/toggleIsActive/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        // Find the user by userId
        const user = await User.findOne({ userId });

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Toggle the isActive property
        user.isActive = !user.isActive;
        await user.save();

        return res.json({ success: true, isActive: user.isActive });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


module.exports = router;
