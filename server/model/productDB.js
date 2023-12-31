const mongoose = require('mongoose');
const { Schema, ObjectId } = mongoose;
const mongoosePaginate = require('mongoose-paginate-v2');
const offerDB = require("../model/offer")
// Define the product schema
const productSchema = new Schema({
    name: {
        type: String,
        required: true,
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
        },
    }],
    offer :{
        hasOffer: {
            type: Boolean,
            default: false
        },
        offerPercent: {
            type: Number,
            default: 0
        },
        offerPrice:{
            type:Number,
            default:0
        },
    },
    isActive: {
        type: Boolean,
        default:true
    }
},{ strict: false });

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
productSchema.pre('save', async function (next) {
    console.log('Mongoose Middleware: Checking for duplicate product names within a brand');
    try {
        const existingProduct = await Product.findOne({
            name: this.name,
            brand: this.brand,
            _id: { $ne: this._id } // Exclude the current product when checking for duplicates during update
        });

        if (existingProduct) {
            const errorMessage = `A product with the name '${this.name}' already exists for this brand.`;
            console.error(errorMessage);
            return next(new Error(errorMessage));
        }

        console.log('Mongoose Middleware: No duplicate product names found within the brand');
        next();
    } catch (error) {
        console.error('Mongoose Middleware Error:', error);
        next(error);
    }
});

// Middleware to check for duplicate color and size combinations
productSchema.pre('save', async function (next) {
    console.log('Mongoose Middleware: Checking for duplicate color and size combinations');
    const variants = this.variants || [];
    const variantMap = new Map();

    for (const variant of variants) {
        const key = `${variant.color}-${variant.size}`;

        if (variantMap.has(key)) {
            const errorMessage = `Duplicate color and size combination found: Color: ${variant.color}, Size: ${variant.size}`;
            console.error(errorMessage);
            return next(new Error(errorMessage));
        }

        variantMap.set(key, true);
    }

    console.log('Mongoose Middleware: No duplicate color and size combinations found');
    next();
});


productSchema.pre('save', async function (next) {
    console.log('Mongoose Middleware: Checking for category offers');
    const subcategory = this.subcategory;
    const offer = await offerDB.findOne({ offerCategory: subcategory });

    console.log(`Offer returned with ${offer}`);
    console.log("*********");
    console.log(subcategory);

    if (offer) {
        const price = this.price;
        const discountPercent = offer.offerDiscount;
        const offerPrice = price - ( price * (discountPercent / 100));

        // Update the product's fields with the category offer data
        this.hasOffer = true;
        this.offerPercent = discountPercent;
        this.offerPrice = offerPrice;
        
        console.log("Added category offer for this product");
    }

    console.log('Mongoose Middleware: Category offer applied (if applicable)');
    next();
});

// You should implement the `fetchImageFromURL` function to retrieve the image data from the URL and return it as a base64 string.
productSchema.plugin(mongoosePaginate);

const Product = mongoose.model('ProductDB', productSchema);

module.exports = Product;
