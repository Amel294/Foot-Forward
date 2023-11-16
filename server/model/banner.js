const mongoose = require('mongoose');
const { Schema } = mongoose;

const bannerSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    hyperlink: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
    images: [
        {
            data: Buffer,       // Store the image data as a Buffer
            contentType: String // Store the content type (e.g., 'image/png', 'image/jpeg')
        }
    ]
});

bannerSchema.pre('save', async function (next) {
    console.log('Mongoose Middleware: Before Saving Banner');
    const images = this.images || [];
    const promises = images.map(async (image) => {
        if (image.url) {
            console.log('Fetching image from URL:', image.url);
            // Assuming you have a function to fetch the image from URL and encode it as base64
            const imageData = await fetchImageFromURLAndEncodeBase64(image.url);
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

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
