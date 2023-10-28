const Product = require('../model/productDB');
const multer = require('multer');
const upload = multer(); // Initialize Multer







// In productController.js
exports.getLastProductIDAdded = async (req, res) => {
    try {
        const lastProduct = await Product.findOne().sort({ _id: -1 });
        if (lastProduct) {
            const lastProductID = parseInt(lastProduct.productId);
            const newProductID = lastProductID + 1;
            res.json({ newProductID });
        } else {
            res.json({ newProductID: 1 });  // Assuming 1 if no products are found.
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.uploadImageMiddleware = upload.single('images');


exports.uploadWithImage = async (req, res) => {
    console.log("Received the following data:", req.body);

    try {
        console.log('Route Handler: Uploading Product with Images');



        // Retrieve form data from req.body
        let { name, brand, category, price, description, trending, productId, isEnabled, subcategory } = req.body;
        // Process the trending field
        trending = req.body.trending === 'on';  // converts "on" to true, anything else to false

        // Provide a default value for isEnabled if not provided
        isEnabled = req.body.isEnabled || false; // default to false if not provided
        // Validate required fields


        console.log("brand:", brand);
        console.log("name:", name);
        console.log("price:", price);
        console.log("category:", category);
        console.log("description:", description);
        console.log("productId:", productId);

        if (!name || !brand || !category || !price || !description || !productId) {
            console.log('Validation Error: All required fields must be provided');
            return res.status(400).json({ error: 'All required fields must be provided' });
        }

        // Create a new product instance with the form data
        const product = new Product({
            name,
            brand,
            category,
            subcategory,
            price,
            description,
            trending,
            productId,
            isEnabled,
        });

        // Set the images array based on the uploaded image(s)
        if (req.file) {
            console.log('Processing Uploaded Image:', req.file.originalname);
            const { buffer, mimetype } = req.file;
            product.images.push({
                data: buffer,
                contentType: mimetype,
                main: true, // Set to true for the main image
            });
        }

        // Save the product to the database
        const savedProduct = await product.save();
        console.log('Product Added Successfully:', savedProduct);

        res.status(201).json({ success: true, message: 'Product added successfully', product: savedProduct });
    } catch (error) {
        console.error('Route Handler Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.addProductWithVariants = async (req, res) => {
    const { name, brand, category, price, description, trending, productId, isEnabled, subcategory, variants } = req.body;

    const product = new Product({
        name,
        brand,
        category,
        subcategory,
        price,
        description,
        trending,
        productId,
        isEnabled,
        variants: JSON.parse(variants) // Parse the variants string back to an array
    });

    try {
        await product.save();
        res.status(201).json({ success: true, message: 'Product with variants added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
