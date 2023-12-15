const nodemailer = require('nodemailer');
const User = require("../model/userDB");
const bcrypt = require('bcrypt');
const Cart = require("../model/cart")
const ProductDB = require('../model/productDB');
const mongoose = require('mongoose');
const Color = require('../model/productAttribute/colorDB');
const Size = require('../model/productAttribute/sizeDB');
const Banner = require('../model/banner');
const Address = require('../model/address')
const Order = require('../model/order');
const Wishlist = require('../model/wishlist');
const util = require('util');
const adminReferral = require("../model/referral")
const Referral = require("../model/ReferralModel")
const Wallet  = require("../model/wallet")

const userSideMiddleware = require("../middleware/userSideMiddleware")
// SMTP configuration
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

function generateOtpForUser(session) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  session.otp = otp;
  session.otpExpirationTime = Date.now() + 1 * 60 * 1000; // 3 minutes from now

  // Server-side countdown to reset the session variable
  setTimeout(() => {
    session.otpExpirationTime = null;
    session.otp = null;
  }, 1 * 60 * 1000);  // 3 minutes in milliseconds

  return session;
}

async function sendOtpEmail(session, isResend = false) {
  const subject = isResend ? `Your Resend OTP Code ` : 'Your OTP Code';
  let mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: session.email,
    subject: subject,
    text: `Your OTP code is: ${ session.otp }`
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
}

exports.home = async (req, res) => {
  try {
    let wishlistCount = 0; // Initialize wishlistCount

    // Check if req.session.user is defined before accessing its properties
    if (req.session && req.session.user && req.session.user.id) {
      wishlistCount = userSideMiddleware.getWishlistCountOfUser(req.session.user.id);
    }

    // Fetch existing banners from the database
    const existingBanners = await Banner.find({ active: true });

    const products = await ProductDB.find()
      .sort({ createdAt: -1 }) // Sort by creation date descending
      .limit(6);
    console.log(products);

    // Render the banner page and pass the existing banners
    res.render('user/home', { banners: existingBanners, products: products, req, wishlistCount });
  } catch (error) {
    // Handle errors
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
};






exports.signUp = (req, res) => {
  res.render('user/signUp')
}

exports.signIn = (req, res) => {
  res.render('user/signIn',{req})
}

exports.myOrders = (req, res) => {
  res.render('user/myOrders')
}

exports.otpPage = async (req, res) => {
  console.log("inside emailOTP route")
  if (!req.session.temp) {
    console.log("There was no temp session")
    req.session.temp = {}; // Initialize req.session.temp as an empty object
  }

  console.log(req.session.temp)
  if (!req.session.temp.otp || !req.session.temp.otpExpirationTime) {
    generateOtpForUser(req.session.temp);

    try {
      await sendOtpEmail(req.session.temp);
    } catch (error) {
      return res.status(500).send("Error sending OTP email.");
    }
  }

  res.render('user/emailOtp', { countdownExpirationTime: req.session.temp.otpExpirationTime });
};


exports.signup_POST = (req, res) => {
  console.log("inside signup.post")
  const fullName = req.body.full_name;
  const email = req.body.email;
  const phone = req.body.phone.toString();
  const password = req.body.password;
  const referralCode = req.body.referralCode;
  // Check if the phone number is empty
  if (!phone) {
    return res.status(400).json({ error: "Phone number is required" });
  } else {
    console.log(phone)
  }

  // Store user information in the session
  req.session.temp = {
    fullName,
    email,
    phone,
    password,
    referralCode
  };

  req.session.save();
  
  // Redirect to the '/emailOtp' route and render the 'emailOtp' view
  res.redirect('/emailOtp');
}

exports.resend = async (req, res) => {
  generateOtpForUser(req.session.temp);

  try {
    await sendOtpEmail(req.session.temp, true);
  } catch (error) {
    return res.status(500).send(`Error sending OTP email. ${ error.message }`);
  }

  return res.status(200).json({
    success: true,
    message: "OTP Sent!",
    otpExpirationTime: req.session.temp.otpExpirationTime
  });
}

// Function to update or create a wallet for a user
// Function to update or create a wallet for a user
async function updateOrCreateWallet(userId, description, amount, type) {
  try {
    console.log(`Updating/Creating Wallet with - Description: ${description}, Amount: ${amount}, Type: ${type}`);

    let wallet = await Wallet.findOne({ user: userId });
    console.log(type)
    // Ensure the type is either 'Dr' or 'Cr'
    if (!['Dr', 'Cr'].includes(type)) {
      throw new Error("Invalid type for wallet transaction. Must be 'Dr' or 'Cr'");
    }
    if (!['Dr', 'Cr'].includes(type)) {
      throw new Error("Invalid type for wallet transaction.");
    }

    if (!wallet) {
      // Create a new wallet if it doesn't exist
      wallet = new Wallet({
          user: userId,
          balance: amount,
          transactions: [{ description, amount, type }]
      });
    } else {
      // Update existing wallet
      wallet.balance += amount;
      wallet.transactions.push({ description, amount, type });
    }

    await wallet.save();
  } catch (error) {
    console.error("Error in updateOrCreateWallet:", error);
    throw error; // Rethrow the error so it can be caught where this function is called
  }
}


exports.verifyOTP = async (req, res) => {
  console.log("Verify OTP");
  const userOtp = req.body.otp;
  console.log(req.session.temp);
  if (Date.now() > req.session.temp.otpExpirationTime) {
    return res.json({ success: false, message: 'OTP has expired!' });
  }
  console.log("Date created");
  console.log(req.session.temp);
  if (userOtp === req.session.temp.otp) {
    try {
      console.log("OTP VERIFIED");
      console.log(req.session.temp);
      const user = new User(req.session.temp);  // No need to manually hash the password
      console.log("In verify Otp");
      console.log(user)
      console.log(req.session.temp);
      await user.save();
      console.log(`Created user ${user._id}` )
      if (req.session.temp.referralCode) {
        // Find the referrer by the referral code
        const referral = await Referral.findOne({ referralCode: req.session.temp.referralCode });
        console.log(`Referal is ${referral}`)
        if (referral) {
                
                const oldUser = await User.findOne({_id:referral.ownedBy})
                const newUser = await User.findOne({_id:user._id})
                await updateOrCreateWallet(oldUser, `Referral bonus received : (${newUser.fullName})`, 50,'Cr');
                await updateOrCreateWallet(newUser._id, `Referral bonus for joining`, 50,'Cr');

                console.log("*****************")
                console.log(`New user ${newUser}` )
                console.log("*****************")
                console.log(`old user ${oldUser}` )
                console.log("*****************")
                try {
                  // Assuming newUser.fullName is the correct field and it's a string
                  const updatedReferral = await Referral.findOneAndUpdate(
                    { referralCode: req.session.temp.referralCode },
                    { $push: { usedBy: newUser.fullName } },
                    { new: true }
                  );
                
                  console.log("Updated referral document:", updatedReferral);
                } catch (error) {
                  console.error("Error updating referral:", error);
                }

            }
        }
    
      req.session.temp = null;  // Clear the temporary session data
      res.json({ success: true, message: 'OTP verified successfully and user saved!' });
    } catch (error) {
      console.error("Database Error:", error.message);  // Log the specific error message
      res.status(500).json({ success: false, message: 'There was an error saving the user.' });
    }
  } else {
    res.json({ success: false, message: 'Wrong OTP. Please try again.' });
  }
};





exports.postUser = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // Create a new user instance
    const user = new User({
      fullName: fullName,
      email: email,
      phoneNumber: phone,
      password: password  // The password will be hashed automatically due to the schema middleware
    });


    console.log("Justbefore save")
    console.log(user)
    // Save the user in the database
    await user.save();

    // Send a success response
    res.status(201).send({ message: "User created successfully!" });
  } catch (error) {
    // Handle errors (e.g., validation errors, database errors, etc.)
    res.status(500).send({ error: error.message });
  }
};






exports.authenticatePassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Compare the entered password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // Passwords match - user is authenticated

      // Create a session to store user information
      req.session.user = {
        id: user._id, // You can store any user-related data here
        email: user.email,
        // Add any other user data you want to store in the session
      };
      // Redirect to the /products route
      return res.redirect('/products');
    } else {
      // Passwords don't match
      return res.status(401).send('Authentication failed');
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
}

exports.logout = async (req, res) => {
  try {
    // Attempt to destroy the user session
    await new Promise((resolve, reject) => {
      req.session.destroy(err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // If the session was destroyed without throwing an error, redirect to login
    res.redirect('/products'); // Replace with your login route
  } catch (err) {
    // If there was an error destroying the session, handle it here
    console.error('Logout failed:', err);
    res.status(500).send('Error logging out. Please try again.');
  }
};






exports.smallcart = async (req, res) => {
  try {
    const userId = req.session.user.id; // Assuming you have the user's ID
    console.log('User ID:', userId);

    // Find the user's cart
    const userCart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!userCart) {
      console.log('User cart not found or empty.');
      return res.status(404).send('User cart not found or empty.');
    }

    // console.log('User cart found:', userCart);

    // Initialize variables for cart items and total price
    const cart = [];
    let total = 0;

    // Iterate through cart items and populate product details
    for (const item of userCart.items) {
      const product = await ProductDB.findById(item.product._id)
        .populate('variants.color variants.size');

      if (!product) {
        console.log('Product not found:', item.product._id);
        continue; // Skip this item and move to the next one
      }

      // Extract color and size details from the populated variants
      const color = product.variants[0].color;
      const size = product.variants[0].size;

      // Calculate the total price for this item
      const itemTotal = item.quantity * product.price;
      total += itemTotal;

      // Create an object with the desired product details
      const cartItem = {
        product: product.name,
        color: color.name,
        size: size.value,
        stock: product.variants[0].stock,
        quantity: item.quantity,
        itemTotal, // Total price for this item
      };

      cart.push(cartItem);
    }

    console.log('Cart :', cart);
    console.log('Total:', total);

    res.json({
      cartItem : cart,
      total,
    });
  } catch (error) {
    console.error('Error fetching the user cart:', error);
    res.status(500).send('Error fetching the user cart');
  }
};










exports.userDashboard = async (req, res) => {
  try {
    const wishlistCount = userSideMiddleware.getWishlistCountOfUser(req.session.user.id)
    const id = req.session.user.id;
    const addresses = await Address.find({ userId: req.session.user.id });
    const user = await User.findOne({ _id: id });
    const orders = await Order.find({ user: id }).populate('items.product');
    const wishlist = await Wishlist.find({user: id}).populate('products')
    let wallet = await Wallet.findOne({user: id});
    // Fetch product images for each product in the orders
    for (const order of orders) {
      for (const item of order.items) {
        const product = await ProductDB.findById(item.product._id);
        item.product.images = product.images;
        item.product.price  = product.price;
      }
    }

    if(!wallet){
      new Wallet({user: id}).save()
    }
    console.log(`wallet balance is ${wallet}`)

    wallet = await Wallet.findOne({user: id});
    const adminRef = await adminReferral.findOne({},{isEnabled:1 ,_id:0})
    const refer = await Referral.findOne({ownedBy:id},{referralCode:1,_id:0});
    console.log(orders)
    res.render('user/userDashboard', { addresses: addresses, user: user, orders: orders,wishlist : wishlist,adminRef,refer,req,wishlistCount,wallet  });
  } catch (error) {
    console.error("Failed to get addresses and orders for user:", error);
    res.status(500).render('error', { message: 'Unable to fetch addresses and orders.' });
  }
}









