const Address = require("../model/address")
const userDB = require("../model/userDB")
const Cart = require("../model/cart")
const razhoPay = require("../middleware/razhopay")
const Coupon = require("../model/coupon")

exports.checkout = async (req, res) => {
  const id = req.session.user.id;
  const addresses = await Address.find({ userId: req.session.user.id });
  const user = await userDB.findOne({ _id: id });

  const cart = await Cart.findOne({ user: id }, { _id: 0, total: 1, coupon: 1 });
  console.log(cart)
  const currentDate = new Date();
  const availableCoupon = await Coupon.find({
    minimumOrderAmount: { $lte: cart.total },
    validUntil: { $gte: currentDate }
  });

  console.log(`Cart. coupan is : ${ cart }`)
  let coupon;
  if (cart.coupon) {
    coupon = await Coupon.findOne({ _id: cart.coupon });
  }
  console.log(`Appplied coupan is ${coupon}`)

  res.render('user/checkout', { addresses: addresses, user: user, coupons: availableCoupon, coupon });
};
