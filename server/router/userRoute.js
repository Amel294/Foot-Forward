const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer'); // Import nodemailer here
const dotenv = require("dotenv");
const path = require('path'); // Import the 'path' module
const userDB = require("../model/userDB")
const controller = require("../controller/userController")
const Product = require('../model/productDB');
const Brand = require('../model/productAttribute/brandDB');
const Color = require('../model/productAttribute/colorDB');
const Size = require('../model/productAttribute/sizeDB');
const Category = require('../model/productAttribute/categoryDB');
const Cart = require("../model/cart")
const wishlist = require("../model/wishlist")
const { findOne } = require('../model/counterDB');

// Apply globally
router.use(checkSession);



function checkSession(req, res, next) {
  // Check if session and user exists
  if (req.session && req.session.user) {
    // User is authenticated
    res.locals.isAuthenticated = true;
  } else {
    // User is not authenticated
    res.locals.isAuthenticated = false;
  }
  next();
}

function signedin(req, res, next) {
  if (req.session && req.session.user) {
    // Reload the current page (client-side) using JavaScript
    res.redirect('/products')
  }
  next(); // Continue to the next middleware or route handler
}


//signup
router.get('/', controller.signUp);
router.get('/signup',signedin, controller.signUp);
router.get('/signin',signedin, controller.signIn);
router.get('/emailOtp',controller.otpPage)


router.get('/products',async  (req,res)=>{
    try {
        // Fetch the list of brands from the database
        const brands = await Brand.find();
    
        // Fetch the list of colors from the database
        const colors = await Color.find();
        const subcategories = await Category.find().distinct('Subcategory');
        const products = await Product.find().populate('brand').populate('subcategory').exec();
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
          products.forEach((product) => {
            console.log(product.brand);
        });
        res.render('user/productview', { brands, colors,subcategories,products,minPrice, maxPrice  });
      } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
      }
})

router.get('/product/:productId', async (req, res) => {
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
    console.log(`Variant ${index + 1}:`);
    console.log("Color:", variant.color);
    console.log("Size:", variant.size);
    console.log("Stock:", variant.stock);
    console.log("Varient ID",variant._id)
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
});








router.get('/myOrders', controller.myOrders);





//api

router.post('/signup',controller.signup_POST );
router.post('/resendOtp', controller.resend);
router.post('/verifyOtp', controller.verifyOTP);



router.post('/postUser', controller.postUser);
router.post('/authenticate', controller.authenticatePassword);
router.post('/logout',controller.logout)
//wishlist and cart
router.get('/cart/total', async (req, res) => {
  try {
    // Assuming `Cart` is your Mongoose model for the cart collection
    const cart = await Cart.findOne({ user: req.session.user.id }); // Find the cart for the current user
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    // Send the total as a response
    res.json({ total: cart.total });
  } catch (error) {
    console.error('Error fetching cart total:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/cart',controller.cart)
router.get('/cart/items-count', async (req, res) => {
  try {
    console.log("Im here");
    // Assuming you have a middleware that sets req.user to the logged-in user's info
    if (!req.session.user.id) {
      return res.status(401).json({ message: "User is not authenticated." });
    }
    console.log("Im here");
    // Find the cart for the logged-in user
    const cart = await Cart.findOne({ user: req.session.user.id });
    if (!cart) {
      return res.status(200).json({ count: 0 }); // No cart means 0 items
    }
    console.log("Im here");
    // Calculate the total number of items in the cart
    const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);

    // Respond with the count
    res.status(200).json({ count: itemCount });
  } catch (error) {
    console.error('Error getting cart items count:', error);
    res.status(500).json({ message: "Internal server error." });
  }
});



async function calculateCartTotal(cartId) {
  const cart = await Cart.findById(cartId).populate('items.product');
  if (!cart) return;

  let total = 0;
  for (const item of cart.items) {
    console.log(`Price: ${item.product.price}, Quantity: ${item.quantity}`); // Add this line for debugging
    total += item.product.price * item.quantity;
  }

  console.log(`Total: ${total}`); // Add this line for debugging
  cart.total = total;
  await cart.save();
}


// POST route to add items to the cart
router.post('/add-to-cart', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { productId, variantId, quantity } = req.body;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId && item.variant.toString() === variantId);
    
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, variant: variantId, quantity });
    }

    await cart.save();
    await calculateCartTotal(cart._id);
    res.status(200).send('Item added to cart');
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).send('Error adding to cart');
  }
});

// DELETE route to remove an item from the cart
router.delete('/cart/remove/:itemId', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const itemId = req.params.itemId;

    // Find the cart, remove the item, and return the updated cart
    const updatedCart = await Cart.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { _id: itemId } } },
      { new: true } // This option returns the updated document
    );

    // If the cart is not found, send an error response
    if (!updatedCart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    // Recalculate the cart total using the cart ID
    await calculateCartTotal(updatedCart._id);

    // Send back the updated total
    res.json({ success: true, total: updatedCart.total });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ success: false, message: 'Failed to remove item' });
  }
});


// PUT route to update the quantity of an item in the cart
router.put('/cart/update-quantity/:itemId', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const itemId = req.params.itemId;
    const quantity = Math.min(10, Math.max(1, req.body.quantity));

    // First, find the cart for the user
    const userCart = await Cart.findOne({ user: userId });
    if (!userCart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    // Then, update the quantity of the item in the cart
    const updateResult = await Cart.updateOne(
      { 'user': userId, 'items._id': itemId },
      { '$set': { 'items.$.quantity': quantity } }
    );

    // If the item quantity was updated, recalculate the cart total
    if (updateResult.modifiedCount > 0) {
      await calculateCartTotal(userCart._id); // Pass the cart ID instead of the user ID
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating item quantity:', error);
    res.status(500).json({ success: false, message: 'Failed to update quantity' });
  }
});







module.exports = router;
