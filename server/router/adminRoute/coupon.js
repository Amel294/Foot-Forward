const express = require("express");
const router = express.Router();
const couponController =require("../../controller/couponController")
const Coupon = require('../../model/coupon'); // Import your Coupon model
const Cart = require("../../model/cart")

router.get('/coupon',couponController.getCoupons)


router.post('/add-coupon', async (req, res) => {
    try {
      // Retrieve data from the request body
      const { coupanName,coupon_enable,coupanDiscount, coupanDate, coupanTime, coupanMinOrderAmount, coupanTotal, coupon_type,coupanDescription } = req.body;
  
        console.log(req.body)
      // Create a new coupon object
      const newCoupon = new Coupon({
        code: coupanName,
        discount: parseFloat(coupanDiscount),
        type: coupon_type,
        validUntil: new Date(`${coupanDate} ${coupanTime}`),
        minimumOrderAmount: parseFloat(coupanMinOrderAmount),
        maxUses: parseInt(coupanTotal),
        active: coupon_enable === "Enable" ? true : false, 
        Description : coupanDescription,
      });
  
      // Save the new coupon to the database
      await newCoupon.save();
  
      // Respond with a success message
      res.json({ message: 'Coupon added successfully' });
    } catch (error) {
      // Log the error for debugging purposes
      console.error('Error:', error);
  
      // Check if it's a validation error (e.g., invalid data format)
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
  
      // Handle other types of errors
      res.status(500).json({ message: 'An error occurred while adding the coupon' });
    }
  });
  
  router.post('/update-coupon-status', async (req, res) => {
    const { couponId, active } = req.body;
    try {
        await Coupon.findByIdAndUpdate(couponId, { active });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update coupon' });
    }
});



router.get('/editCoupon/:couponid', async (req,res)=>{

  console.log(req.params.couponid)
  let coupon = await Coupon.find({_id: req.params.couponid});
  coupon = coupon[0]
  // const coupon = await Coupon.find({_id: req.params.couponid});
  console.log(coupon)
  res.render('editCoupon.ejs' , {coupon,activeRoute: 'coupon'})
})

router.post('/editCoupons/:couponId', async (req, res) => {
  try {
    console.log("I am here");
    const couponId = req.params.couponId;
    const {
      coupanName,
      coupanDescription,
      coupanDiscount,
      coupanDate,
      coupanTime,
      coupanMinOrderAmount,
      coupanTotal
    } = req.body;

    // Parse date and time strings
    const [day, month, year] = coupanDate.split('/');
    const [hours, minutes, seconds] = coupanTime.split(':');

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      couponId,
      {
        code: coupanName,
        Description: coupanDescription,
        discount: coupanDiscount,
        validUntil: new Date(year, month - 1, day, hours, minutes, seconds),
        minimumOrderAmount: coupanMinOrderAmount,
        maxUses: coupanTotal
        // Add other fields as needed
      },
      { new: true } // Return the updated document
    );


   

    if (!updatedCoupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    const test = await Cart.find({coupon: couponId})
    if(test){
      console.log("There are results")
    }
    else{
      console.log("There are no results")

    }
    console.log(test)
    const products = await Cart.updateMany(
      { coupon: couponId },
      { $set: { coupon: updatedCoupon._id } }
    );

    res.status(200).json({ message: 'Coupon updated successfully', updatedCoupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});





module.exports = router;