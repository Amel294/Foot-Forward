const mongoose = require('mongoose');
const { Schema, ObjectId } = mongoose;

// Define the product schema
const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    brand: {
        type: ObjectId,
        ref: 'Brand',
        required: true
    },
    category: {
        type: String,
        required: true
    },
    subcategory: {
        type: ObjectId,
        ref: 'Category',
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    trending: {
        type: Boolean,
        default: false
    },
    productId: {
        type: Number,
        required: true,
        unique: true
    },
    isEnabled: {
        type: Boolean,
        default: true
    },
    images: [
        {
            data: Buffer,       // Store the image data as a Buffer
            contentType: String, // Store the content type (e.g., 'image/png', 'image/jpeg')
        }
    ],
    variants: [{
        color: {
            type: ObjectId, // Reference to Color object ID
            ref: 'Color', // Reference to the 'Color' model
            required: true
        },
        size: {
            type: ObjectId, // Reference to Size object ID
            ref: 'Size', // Reference to the 'Size' model
            required: true
        },
        stock: {
            type: Number,
            required: true
        }
    }]
});

// Middleware to convert image URLs to base64 and set content type
productSchema.pre('save', async function (next) {
    console.log('Mongoose Middleware: Before Saving Product');
    const images = this.images || [];
    const promises = images.map(async (image) => {
        if (image.url) {
            console.log('Fetching image from URL:', image.url);
            // Assuming you have a function to fetch the image from URL
            const imageData = await fetchImageFromURL(image.url);
            if (imageData) {
                image.data = Buffer.from(imageData, 'base64');
                image.contentType = 'image/' + image.extension; // You need to set the appropriate content type here
                delete image.url;
            }
        }
    });

    try {
        await Promise.all(promises);
        console.log('Mongoose Middleware: Images processed successfully');
        next();
    } catch (error) {
        console.error('Mongoose Middleware Error:', error);
        next(error);
    }
});

productSchema.statics.getPriceById = async function(productId) {
    // Convert string to ObjectId
    const objectId = new mongoose.Types.ObjectId(productId);
    const product = await this.findOne({ _id: objectId });
    return product ? product.price : null;
};


// You should implement the `fetchImageFromURL` function to retrieve the image data from the URL and return it as a base64 string.

const Product = mongoose.model('ProductDB', productSchema);

module.exports = Product;
