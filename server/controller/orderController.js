const Order =require("../model/order")

exports. orderSuccess = async (req,res)=>{
    const userId = req.session.user.id; 
    const order = await Order.findOne({ user: userId }).sort({ orderDate: -1 });
    console.log(order)
    res.render('user/orderSuccess',{order : order})
  }