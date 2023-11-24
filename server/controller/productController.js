const Product = require('../model/productDB');
const multer = require('multer');
const storage = multer.memoryStorage(); // Store files in memory as Buffers
const upload = multer({ storage: storage })
const brand = require('../model/productAttribute/brandDB')
const subcategories = require('../model/productAttribute/categoryDB')
const color = require("../model/productAttribute/colorDB")
const Category = require("../model/productAttribute/categoryDB")



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

    const { name, brand, category, price, description, isEnabled, subcategory, variants } = req.body;

    const isTrending = req.body.trending === "on" ? true : false;
    // Fetch the last added product's ID and increment it
    const lastProduct = await Product.findOne().sort({ _id: -1 });
    const productId = lastProduct ? parseInt(lastProduct.productId) + 1 : 1;

    console.log('Generated productId:', productId); // Debugging statement for generated productId


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
    console.log('Processed images:', product.images);

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




// Handle the editing of a product with variants and images
exports.editProductWithVariants = async (req, res) => {
    // Fetch product by ID and update
    const productId = req.params.productId;
    try {
        const product = await Product.findOne({ productId: productId });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update product details
        product.name = req.body.name || product.name;
        product.price = req.body.price || product.price;
        product.trending = req.body.trending === "on" ? true : false;

        // Save the updated product
        const updatedProduct = await product.save();
        res.status(200).json({ success: true, message: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
        console.error('Error in editProductWithVariants:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



exports.getProductData = async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await Product.findOne({ productId: productId })
            .populate('brand')
            .populate('subcategory');

        if (!product) {
            return res.status(404).send('Product not found');
        }

        // Fetch all brands and subcategories
        const allBrands = await brand.find({});
        const allSubcategories = await subcategories.find({});
        product.images = product.images.map(image => {
            return {
                ...image,
                base64Data: `data:${ image.contentType };base64,${ image.data.toString('base64') }`
            };
        });

        // Render the page with product data, all brands, and all subcategories
        res.render('editProducts', {
            product: product,
            allBrands: allBrands,
            allSubcategories: allSubcategories,
            activeRoute: 'dashboard'
        });
    } catch (error) {
        console.error('Error in fetching product:', error);
        res.status(500).send('Server Error');
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        // Fetch the list of brands from the database
        const brands = await brand.find();
        const colors = await color.find();
        const subcategories = await Category.aggregate([
            {
                $group: {
                    _id: { Subcategory: "$Subcategory", _id: "$_id" }
                }
            },
            {
                $project: {
                    category: "$_id.Subcategory",
                    _id: "$_id._id"
                }
            }
        ]);

        // Now, subcategories will contain an array of objects with both Subcategory and _id fields

        // const products = await Product.find().populate('brand').populate('subcategory').exec();
        const priceRange = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    minPrice: { $min: "$price" },
                    maxPrice: { $max: "$price" }
                }
            }
        ]);

        const minPrice = priceRange[0].minPrice;
        const maxPrice = priceRange[0].maxPrice;
        // Render your EJS template and pass the brands and colors data
        // Log the brand of each product
        subcategories.forEach((subcategorie) => {
            console.log(subcategorie);
        });
        // brands.forEach((brand) => {
        //   console.log(brand);
        // });
        
        const currentPage = parseInt(req.query.page) || 1;

        res.render('user/productview', { brands, colors, subcategories, minPrice, maxPrice,currentPage  });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
}


exports.productById = async (req, res) => {
    const productId = req.params.productId;

    try {
        // Aggregation pipeline to find the product and populate related data
        const pipeline = [
            { $match: { productId: parseInt(productId, 10) } }, // Ensure to match the type (string or number)
            {
                $lookup: {
                    from: 'brands', // Replace with your actual collection name for brands
                    localField: 'brand',
                    foreignField: '_id',
                    as: 'brand'
                }
            },
            { $unwind: '$brand' }, // Assuming there is only one brand per product
            {
                $lookup: {
                    from: 'categories', // Replace with your actual collection name for categories
                    localField: 'subcategory',
                    foreignField: '_id',
                    as: 'subcategory'
                }
            },
            { $unwind: '$subcategory' }, // Assuming there is only one category per product
            {
                $lookup: {
                    from: 'colors', // Replace with your actual collection name for colors
                    localField: 'variants.color',
                    foreignField: '_id',
                    as: 'variantColors'
                }
            },
            {
                $lookup: {
                    from: 'sizes', // Replace with your actual collection name for sizes
                    localField: 'variants.size',
                    foreignField: '_id',
                    as: 'variantSizes'
                }
            },
            {
                $project: {
                    name: 1,
                    brand: 1,
                    category: '$subcategory', // Use the populated 'subcategory' object
                    price: 1,
                    description: 1,
                    trending: 1,
                    productId: 1,
                    isEnabled: 1,
                    images: 1,
                    variants: {
                        $map: {
                            input: '$variants',
                            as: 'variant',
                            in: {
                                _id: '$$variant._id',
                                color: {
                                    $arrayElemAt: [
                                        '$variantColors',
                                        { $indexOfArray: ['$variantColors._id', '$$variant.color'] }
                                    ]
                                },
                                size: {
                                    $arrayElemAt: [
                                        '$variantSizes',
                                        { $indexOfArray: ['$variantSizes._id', '$$variant.size'] }
                                    ]
                                },
                                stock: '$$variant.stock'
                            }
                        }
                    }
                }
            }
        ];

        // Execute the aggregation pipeline
        const productData = await Product.aggregate(pipeline);
        console.log(productData)
        // Assuming productData is an array with one or more objects
        // Assuming productData is an array with one or more objects
        productData.forEach((product) => {
            console.log("Product Name:", product.name);
            console.log("Product Brand:", product.brand.name);

            product.variants.forEach((variant, index) => {
                console.log(`Variant ${ index + 1 }:`);
                console.log("Color:", variant.color);
                console.log("Size:", variant.size);
                console.log("Stock:", variant.stock);
                console.log("Varient ID", variant._id)
                console.log("---------------------------");
            });
        })


        // Check if product data was found
        if (!productData || productData.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Send the response with the populated product data
        res.render('user/productSingle', { productData: productData[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

