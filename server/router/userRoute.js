const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer'); // Import nodemailer here
const mongoose = require('mongoose'); // Corrected 'Mongoose' to 'mongoose'
const { Schema, ObjectId } = mongoose;

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
const Address = require("../model/address")
const Order = require('../model/order'); // Adjust the path to your Order model
const userMiddleware = require('../middleware/userSideMiddleware')
const cartController = require("../controller/cartController")
const productController = require("../controller/productController")
const orderController = require("../controller/orderController")
const addressController = require("../controller/addressController")
const wishlistController = require("../controller/wishlistController")
const couponController = require("../controller/couponController")
// Apply globally
router.use(checkSession);
router.get('/blocked',(req,res)=>{
  res.render('blocked')
})

async function isActive(req, res, next) {
  try {
    // Assuming you have the user's ID in req.session.user.id
    const userId = req.session.user.id;
    
    // Fetch the user from the database
    const user = await userDB.findById(userId);

    if (!user) {
      // User not found in the database, handle accordingly
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isActive) {
      // User is active, continue with the request
      next();
    } else {
      // User is not active, destroy the session
      req.session.destroy(function (err) {
        if (err) {
          console.error('Error destroying session:', err);
          res.status(500).json({ message: 'Internal server error' });
        } else {
          res.redirect("/blocked")
        }
      });
    }
  } catch (error) {
    console.error('Error checking isActive status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


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

function Protected(req,res,next){
  if(req.session && req.session.user){
    next();
  }else{
    res.redirect('/signin')

  }
}

//home
router.get('/', controller.home);

//signup

router.get('/signup', signedin, controller.signUp);
router.get('/signin', signedin, controller.signIn);
router.get('/emailOtp', controller.otpPage)


router.get('/products',productController.getAllProducts)

router.get('/product/:productId', productController.productById);



router.get('/products/filter', async (req, res) => {
  try {
    const { brand, color, category,search } = req.query;

    let filters = {};
    if (brand) {
      filters.brand = { $in: brand.split(',') };
    }
    if (color) {
      filters['variants.color'] = { $in: color.split(',') };
    }
    if (category) {
      filters.subcategory = { $in: category.split(',') };
    }
    if (search) {
      filters.name = { $regex: search, $options: 'i' }; // Use regex for partial matching
    }

    // Fetch all necessary data
    const brands = await Brand.find({ isDeleted: false });
    const colors = await Color.find({ isDeleted: false });
    const subcategories = await Category.find({ isDeleted: false }).distinct('Subcategory');
    let products = await Product.find(filters).populate('brand').populate('subcategory').exec();
    let userWishlist ;
    if(req.session.user){
      const userId = req.session.user.id;
       userWishlist = await wishlist.findOne({ user: new mongoose.Types.ObjectId(userId) });
  
      // Add isInWishlist field to each product
      products = products.map(product => {
        product = product.toObject(); // Convert Mongoose document to plain JavaScript object
        product.isInWishlist = userWishlist && userWishlist.products.includes(product._id.toString());
        return product;
      });
      console.log(products)
    }
    
    // Retrieve user's wishlist
   
    // Pass all the necessary data to the EJS template
    res.render('user/includeUser/content_productView_singleProduct', {
      products,
      brands,
      colors,
      subcategories,
      Wishlist: userWishlist,
      req
    });

  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
});












router.get('/myOrders', userMiddleware.isUserLogged, controller.myOrders);





//api

router.post('/signup', controller.signup_POST);
router.post('/resendOtp', controller.resend);
router.post('/verifyOtp', controller.verifyOTP);



router.post('/postUser', controller.postUser);
router.post('/authenticate', controller.authenticatePassword);
router.post('/logout', controller.logout)


router.get('/cart/total', cartController.cartTotal);
router.get('/cart', cartController.getCartPage)
router.get('/small-cart', cartController.smallcart)
router.get('/cart/items-count', cartController.itemsInCart);
router.post('/add-to-cart', cartController.addToCart);
router.delete('/cart/remove/:itemId', cartController.removeFromCart);
router.put('/cart/update-quantity/:itemId', cartController.updateQuantity);








router.get('/userDashboard', controller.userDashboard);

router.post('/wishlist/add/:productId', wishlistController.addToWishlist);


router.delete('/wishlist/remove/:productId', wishlistController.removeFromWishlist);
// Cancel Order
router.post('/orders/cancel/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    // Update the order status to 'Cancelled' or appropriate status
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { orderStatus: 'Cancelled By User' }, { new: true });

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Return Order
router.post('/orders/return/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    // Update the order status to 'Return' or appropriate status
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { orderStatus: 'Return' }, { new: true });

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json({ message: 'Order returned successfully' });
  } catch (error) {
    console.error('Error returning order:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/razorpay-keys', (req, res) => {
  const keys = {
    keyId: process.env.RAZORPAY_Key_Id,
    keySecret: process.env.RAZORPAY_Key_Secret
  };
  res.json(keys);
});



router.get('/get-amount-keys-payment-address', async (req, res) => {
  try {
    const userId = req.session.user.id;

    // Find the user's cart and calculate the total order amount
    const cart = await Cart.findOne({ user: userId }).select({ total: 1, _id: 1 });
    console.log(`cart in /get-amount is ${cart}`)
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const keys = {
      keyId: process.env.RAZORPAY_Key_Id,
      keySecret: process.env.RAZORPAY_Key_Secret
    };

    
    console.log(`Orderdata cart.total is  ${cart.total}`);
    console.log(`Orderdata cart.id is  ${cart._id}`);
    console.log(`Orderdata keys.id is  ${keys.keyId}`);
    console.log(`Orderdata keys.secret is  ${keys.keySecret}`);

    // Return the order amount as JSON
    res.json({ cart,keys });
  } catch (error) {
    console.error('Error fetching order amount:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



router.get('/checkout',Protected, addressController.checkout)
// Apply Coupon route (POST)
router.post('/apply-coupon', couponController.addCoupon);

// Remove Coupon route (DELETE)
router.delete('/remove-coupon', couponController.removeCoupon);


router.post('/place-order', Protected,cartController.placeOrder);

router.get('/orderSuccess',Protected, orderController.orderSuccess)

module.exports = router;

