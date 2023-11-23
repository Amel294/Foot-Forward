const Coupon = require("../model/coupon")
const Cart  = require("../model/cart")
exports.getCoupons = async (req,res)=>{

    try {
        const coupons = await Coupon.find(); // Fetching coupons from MongoDB
        const currentDate = new Date();

        // Add 'isExpired' property to each coupon
        coupons.forEach(coupon => {
            coupon.isExpired = coupon.validUntil < currentDate;
        });
        
        res.render('coupon', { coupons ,activeRoute: 'coupon' }); // Passing coupons to the EJS template
    } catch (error) {
        res.status(500).send('Error retrieving coupons');
    }
};

exports.addCoupon = async function addCoupon(req, res) {
    try {
      const { couponCode } = req.body;
      const coupon = await Coupon.findOne({ code: couponCode });
      
      if (!coupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }
  
      // Add additional validation logic (e.g., check expiry date)
  
      const userCart = await Cart.findOne({ user: req.session.user.id }); // Adjust to match your user identification logic
      if (!userCart) {
        return res.status(404).json({ message: 'Cart not found' });
      }
  
      // Apply coupon logic
      userCart.coupon = coupon._id; // or any other necessary data
      await userCart.save();
  
      return res.status(200).json({ message: 'Coupon applied successfully' });
    } catch (error) {
      console.error('Error applying coupon:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  



exports.removeCoupon = async (req, res) => {
    try {
      const { couponCode } = req.body;
  
      // Check if the cart exists and the user is associated with it
      const cart = await Cart.findOne({ user: req.session.user.id });
  
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }
     
      // Check if the cart has the same coupon applied
      if (cart.coupon === couponCode) {
        
        // Remove the coupon from the cart
        cart.coupon = null; // Null indicates no coupon applied
        await cart.save();
  
        return res.status(200).json({ message: 'Coupon removed successfully' });
      } else {
        return res.status(400).json({ message: 'Coupon not found in the cart' });
      }
    } catch (error) {
      console.error('Error removing coupon:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }