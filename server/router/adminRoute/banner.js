const express = require("express");
const router = express.Router();
const multer = require('multer');
const Banner = require("../../model/banner");

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/banner', async (req, res) => {
    try {
        
        // Fetch existing banners from the database
        const existingBanners = await Banner.find();

        // Render the banner page and pass the existing banners
        res.render('banner', { activeRoute: 'banner', existingBanners });
    } catch (error) {
        // Handle errors
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/banner/delete/:id', async (req, res) => {
    try {
        const bannerId = req.params.id;
        // Use findOneAndDelete to find and delete the corresponding banner from the database
        await Banner.findOneAndDelete({ _id: bannerId });
        res.redirect('/admin/banner'); // Redirect back to the banner page after deleting
    } catch (error) {
        // Handle errors (e.g., database errors)
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});






router.post('/banner', upload.single('image'), async (req, res) => {
    try {
        const { title, hyperlink } = req.body;
        // Set the active field to true by default
        const active = true;
        const image = {
            data: req.file.buffer.toString('base64'), // Convert to base64
            contentType: req.file.mimetype
        };

        const newBanner = new Banner({ title, hyperlink, active, images: [image] }); // Store as an array
        await newBanner.save();

        // Redirect or send a response as needed
        res.redirect('banner');
    } catch (error) {
        // Handle errors (e.g., validation errors or database errors)
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});



module.exports = router;
