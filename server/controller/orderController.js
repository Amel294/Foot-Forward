const Order =require("../model/order")
const Product = require("../model/productDB")
const userMiddleware = require("../middleware/userSideMiddleware")
exports. orderSuccess = async (req,res)=>{
  
    const userId = req.session.user.id; 
    //   let userId
    // if(req.body.user){
    //   userId = req.body.user
    // }
    const order = await Order.findOne({ user: userId }).sort({ orderDate: -1 })
    .populate({
      path: 'items.product', // Path to the "product" field within "items"
      model: 'ProductDB' // Replace 'Product' with the actual model name for products
    });    
    console.log("in Success page")
    console.log(order)
    let wishlistCount;
        if(req.session.user){
            wishlistCount = await userMiddleware.getWishlistCountOfUser(req.session.user.id)
            console.log(wishlistCount)
        }
    // res.json(order)
    res.render('user/orderSuccess',{orders : order,req,wishlistCount})
  }