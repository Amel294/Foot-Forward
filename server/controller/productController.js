const Product = require('../model/productDB');
const multer = require('multer');
const storage = multer.memoryStorage(); // Store files in memory as Buffers
const upload = multer({ storage: storage })

// Handle API request to get the last added product's ID
exports.getLastProductIDAdded = async (req, res) => {
    try {
        // Query the last added product by sorting based on '_id' in descending order
        const lastProduct = await Product.findOne().sort({ _id: -1 });

        if (lastProduct) {
            const lastProductID = parseInt(lastProduct.productId);
            const newProductID = lastProductID + 1;
            res.json({ newProductID }); // Respond with the new product ID
        } else {
            res.json({ newProductID: 1 });  // Assuming 1 if no products are found.
        }
    } catch (error) {
        console.error('Error in getLastProductIDAdded:', error);
        res.status(500).send('Server Error');
    }
};

// Middleware for handling image uploads using Multer
exports.uploadImages = (req, res, next) => {
    try {
        upload.array('images', 5)(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading.
                console.error('Multer error:', err);
                return res.status(500).json({ error: 'Error uploading files' });
            } else if (err) {
                // An unknown error occurred when uploading.
                console.error('Unknown upload error:', err);
                return res.status(500).json({ error: 'Unknown error occurred during upload' });
            }
            // Everything went fine, proceed to the next middleware.
            next();
        });
    } catch (error) {
        console.error('Error in uploadImages middleware:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


// Handle the addition of a product with variants and images
exports.addProductWithVariants = async (req, res) => {
    console.log('Received files:', req.files);
    
    const { name, brand, category, price, description, trending, productId, isEnabled, subcategory, variants } = req.body;
    const isTrending = req.body.trending === "on" ? true : false;


    const parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;

    // Create a new product instance with the received data
    const product = new Product({
        name,
        brand,
        category,
        subcategory,
        price,
        description,
        trending: isTrending,
        productId,
        isEnabled: isEnabled || true,
        variants: parsedVariants
    });
    console.log("Logging")
    console.log(product)
    // Process and save the uploaded images
    if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
            const { buffer, mimetype } = file;
            product.images.push({
                data: buffer,
                contentType: mimetype,
            });
        });
    }
    // Process and save the uploaded images - END OF CHANGE

    try {
        // Save the product to MongoDB
        const savedProduct = await product.save();
        console.log('Product with variants and images added successfully:', savedProduct);
        res.status(201).json({ success: true, message: 'Product with variants and images added successfully', product: savedProduct });
    } catch (error) {
        console.error('Error in addProductWithVariants:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
