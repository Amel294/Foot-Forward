const express = require("express");
const router = express.Router();
const productDB = require("../../model/productDB")
const categoryDB = require("../../model/productAttribute/categoryDB")
const Offer = require("../../model/offer")
const Referral = require("../../model/referral")
const dummyOffers = [
    {
        offerName: 'Offer 1',
        offerDescription: 'Description for Offer 1',
        offerType: 'Percent',
        offerDiscount: 10,
        offerExpiryDate: new Date('2023-12-31'),
        offerMinOrderAmount: 2000,
        offerMaxUses: 100,
        offerEnable: true,
    },
    {
        offerName: 'Offer 2',
        offerDescription: 'Description for Offer 2',
        offerType: 'Flat rate',
        offerDiscount: 20,
        offerExpiryDate: new Date('2023-11-30'),
        offerMinOrderAmount: 1000,
        offerMaxUses: null, // Unlimited
        offerEnable: false,
    },
    // Add more dummy offers as needed
];

router.get('/offers', async (req, res) => {
    try {
        // Fetch products from the database (replace with your actual database query)
        const products = await productDB.find({}, { _id: 1, name: 1 });
        const category = await categoryDB.find({}, { _id: 1, Subcategory: 1 });
        const referral = await Referral.findOne({},{isEnabled:1,reward:1});
        const offers = await Offer.find({})
        console.log(offers)
        // Render the EJS template with data
        res.render('offers', { offers, activeRoute: 'offer', products,category,referral });
    } catch (error) {
        // Handle any errors that occur during database query or rendering
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});




router.post('/update-referral-settings', async (req, res) => {
    try {
        const { isEnabled, reward } = req.body;

        // Assuming you want to update a specific document. Replace `someId` with the actual ID.
        const result = await Referral.findByIdAndUpdate(
            '655f12633a118c4181dcbd1c', 
            { isEnabled, reward },
            { new: true }
        );

        res.status(200).json({ message: 'Referral settings updated successfully', result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating referral settings', error: error.message });
    }
});



router.post('/create-offer', async (req, res) => {
    try {
        const newOffer = new Offer(req.body);
        await newOffer.save();

        const discountPercent = newOffer.offerDiscount;

        if (newOffer.offerType === 'Product') {
            const productId = newOffer.offerProduct;
            if (productId) {
                const updatedProduct = await productDB.findByIdAndUpdate(productId, {
                    $set: {
                        hasOffer: true,
                        offerPercent: discountPercent
                    }
                }, { new: true });

                if (!updatedProduct) {
                    throw new Error('Product not found or update failed');
                }
            } else {
                throw new Error('Invalid product ID');
            }
        } else if (newOffer.offerType === 'Category') {
            const categoryId = newOffer.offerCategory;
            if (categoryId) {
                const updateResult = await productDB.updateMany(
                    { subcategory: categoryId }, // Filter to match category
                    {
                        $set: {
                            hasOffer: true,
                            offerPercent: discountPercent
                        }
                    }
                );

                if (updateResult.matchedCount === 0) {
                    throw new Error('No products found in this category or update failed');
                }
            } else {
                throw new Error('Invalid category ID');
            }
        }

        res.status(201).send({ message: 'Offer created successfully', offer: newOffer });
    } catch (error) {
        console.error('Error creating offer:', error);
        res.status(500).send({ message: 'Error creating offer: ' + error.message });
    }
});



router.post('/remove-offer', async (req, res) => {
    try {
        // Assuming the offer ID is sent in the request body
        const { offerId } = req.body;

        // Find the offer by ID
        const offer = await Offer.findById(offerId);
        console.log(offer)
        if (!offer) {
            throw new Error('Offer not found');
        }

        if (offer.offerType === 'Product') {
            const productId = offer.offerProduct;
            if (productId) {
                // Update products with matching offerProduct
                await productDB.updateMany(
                    { _id: productId },
                    {
                        $set: {
                            hasOffer: false,
                            offerPercent: 0
                        }
                    }
                );
            } else {
                throw new Error('Invalid product ID');
            }
        } else if (offer.offerType === 'Category') {
            const categoryId = offer.offerCategory;
            if (categoryId) {
                // Update products with matching category
                await productDB.updateMany(
                    { subcategory: categoryId },
                    {
                        $set: {
                            hasOffer: false,
                            offerPercent: 0
                        }
                    }
                );
            } else {
                throw new Error('Invalid category ID');
            }
        }
        console.log("I reached here");
        
        // Remove the offer using the Mongoose model's remove method
        await Offer.deleteOne({ _id: offerId });

        res.status(200).send({ message: 'Offer removed successfully' });
    } catch (error) {
        console.error('Error removing offer:', error);
        res.status(500).send({ message: 'Error removing offer: ' + error.message });
    }
});






module.exports = router;
