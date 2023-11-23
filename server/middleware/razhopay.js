Razorpay = require('razorpay');
const dotenv = require("dotenv");

exports.Razorpay = function(amountFromUser){
    console.log(`Amount receiver and is ${amountFromUser}`)
    var instance = new Razorpay({ key_id: 'process.env.RAZORPAY_Key_Id', key_secret: 'process.env.RAZORPAY_Key_Secret' })

var options = {
  amount: amountFromUser,  // amount in the smallest currency unit
  currency: "INR",
  receipt: "order_rcptid_11"
};
instance.orders.create(options, function(err, order) {
  console.log(order);
});
}
