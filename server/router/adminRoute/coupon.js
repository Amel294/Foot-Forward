const express = require("express");
const router = express.Router();
const couponController =require("../../controller/couponController")
const Coupon = require('../../model/coupon'); // Import your Coupon model


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


module.exports = router;