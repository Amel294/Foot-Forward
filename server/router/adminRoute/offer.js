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
        const referral = await Referral.findOne({}, { isEnabled: 1, reward: 1 });
        const offers = await Offer.find({})

        console.log(offers)
        // Render the EJS template with data
        res.render('offers', { offers, activeRoute: 'offer', products, category, referral });
    } catch (error) {
        // Handle any errors that occur during database query or rendering
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});




router.post('/update-referral-settings', async (req, res) => {
    try {
        if (!req.session.admin || !req.session.admin.id) {
            return res.status(401).json({ message: 'UNAUTHORIZED' });
        }
        const { isEnabled, reward } = req.body;
        console.log(req.session.admin.id)
        // Assuming you want to update a specific document. Replace `someId` with the actual ID.
        const filter = { _id: "655f12633a118c4181dcbd1c" };
        const update = { isEnabled, reward };
        const options = { new: true };

        const result = await Referral.findOneAndUpdate(filter, update, options);

        if (!result) {
            return res.status(404).json({ message: 'Referral document not found' });
        }

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
                const product = await productDB.findById(productId);
                if (!product) {
                    throw new Error('Product not found');
                }

                const price = product.price; // Assuming 'price' is a field in your product schema
                const offerPrice = price - (price * (discountPercent / 100));

                const updatedProduct = await productDB.findByIdAndUpdate(productId, {
                    $set: {
                        offer: {
                            hasOffer: true,
                            offerPercent: discountPercent,
                            offerPrice: offerPrice
                        }

                    }
                }, { new: true });

                if (!updatedProduct) {
                    throw new Error('Update failed');
                }
            } else {
                throw new Error('Invalid product ID');
            }
        } else if (newOffer.offerType === 'Category') {
            const categoryId = newOffer.offerCategory;
            if (categoryId) {
                const productsInCategory = await productDB.find({ subcategory: categoryId });

                if (productsInCategory.length === 0) {
                    throw new Error('No products found in this category');
                }

                for (const product of productsInCategory) {
                    const price = product.price; // Assuming 'price' is a field in your product schema
                    const offerPrice = price * (discountPercent / 100);

                    await productDB.findByIdAndUpdate(product._id, {
                        $set: {
                            offer: {
                                hasOffer: true,
                                offerPercent: discountPercent,
                                offerPrice: offerPrice
                            }
                        }
                    });
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
        if (!offer) {
            throw new Error('Offer not found');
        }

        if (offer.offerType === 'Product') {
            const productId = offer.offerProduct;
            if (productId) {
                // Reset the products with matching offerProduct to their original state
                const product = await productDB.findById(productId);
                if (product) {
                    const originalPrice = product.price; // Assuming 'price' is a field in your product schema
                    const originalofferPrice = originalPrice * (offer.offerPercent / 100);

                    await productDB.findByIdAndUpdate(productId, {
                        $set: {
                            offer: {
                                hasOffer: false,
                                offerPercent: 0,
                                offerPrice: originalPrice
                            }

                        }
                    });
                } else {
                    throw new Error('Product not found');
                }
            } else {
                throw new Error('Invalid product ID');
            }
        } else if (offer.offerType === 'Category') {
            const categoryId = offer.offerCategory;
            if (categoryId) {
                // Reset the products in the matching category to their original state
                const productsInCategory = await productDB.find({ subcategory: categoryId });

                for (const product of productsInCategory) {
                    const originalPrice = product.price; // Assuming 'price' is a field in your product schema
                    const originalofferPrice = originalPrice * (offer.offerPercent / 100);

                    await productDB.findByIdAndUpdate(product._id, {
                        $set: {
                            offer: {
                                hasOffer: false,
                                offerPercent: 0,
                                offerPrice: originalPrice
                            }
                        }
                    });
                }
            } else {
                throw new Error('Invalid category ID');
            }
        }

        // Remove the offer using the Mongoose model's remove method
        await Offer.deleteOne({ _id: offerId });

        res.status(200).send({ message: 'Offer removed successfully' });
    } catch (error) {
        console.error('Error removing offer:', error);
        res.status(500).send({ message: 'Error removing offer: ' + error.message });
    }
});






module.exports = router;
