const Address = require("../model/address")
const userDB = require("../model/userDB")
const Cart = require("../model/cart")
const razhoPay = require("../middleware/razhopay")
const Coupon = require("../model/coupon")
const userSideMiddleware = require("../middleware/userSideMiddleware")
const Product = require("../model/productDB")
const Color = require("../model/productAttribute/colorDB")
const Size = require("../model/productAttribute/sizeDB")
const Wallet = require("../model/wallet")

async function getDataFromProductsDB(productId, variantId, itemQty, hasoffer = false, offerPercent = 0, req, promocode = null) {
  const productData = await Product.findOne({ _id: productId });

  console.log(`Price is : ${ productData.price } and offer price is ${ productData.offer.offerPrice } in get data function`)
  let itemPriceAfterDisount;
  if (productData && productData.variants && productData.variants.length > 0) {
    // Find the variant that matches the variantId
    const variant = productData.variants.find(v => v._id.toString() === variantId.toString());
    if (productData.offer.offerPercent <= 0) {
      itemPriceAfterDisount = productData.price * itemQty
    } else {
      itemPriceAfterDisount = productData.offer.offerPrice * itemQty
    }
    console.log(itemPriceAfterDisount)
    if (variant) {
      const colorData = await Color.findById(variant.color, 'name -_id');
      const sizeData = await Size.findById(variant.size, 'value -_id');
      const isEmpty = (obj) => {
        return Object.keys(obj).length === 0;
      };
      return {
        name: productData.name,
        price: productData.price,
        actualPrice: productData.price * itemQty,
        OfferPrice: productData.offerPercent ? (productData.price * (1 - (productData.offerPercent / 100))) * itemQty : productData.price * itemQty,
        coupon: isEmpty(!promocode) || promocode == null || promocode == 'undefined' ? null : promocode.coupon.code,
        couponDiscount: isEmpty(!promocode) || promocode == null || promocode == 'undefined' ? null : promocode.coupon.discount,
        color: colorData, // Assuming you have already fetched colorData
        size: sizeData, // Assuming you have already fetched sizeData
        stock: variant.stock,
        hasOffer: productData.hasoffer,
        offerPercent: productData.offerPercent,
        qty: itemQty,
        images: productData.images && productData.images.length > 0 ? productData.images[0] : null, // Check for images existence
        itemPriceAfterDisount: itemPriceAfterDisount,
      };

    } else {
      console.log('Variant not found for the given ID:', variantId);
      return null;
    }
  } else {
    console.log('No product found with the given ID:', productId);
    return null;
  }
}



exports.checkout = async (req, res) => {

  const wishlistCount = userSideMiddleware.getWishlistCountOfUser(req.session.user.id)

  const id = req.session.user.id;
  const addresses = await Address.find({ userId: req.session.user.id });
  const user = await userDB.findOne({ _id: id });
  console.log(req.session.user.id)
  const cart = await Cart.findOne({ user: req.session.user.id }).populate('items.product coupon items.color items.size')

  cart.items.forEach(function (item) {
    const product = item.product; 

    if (product && product.images && product.images.length > 0) {
      console.log(`First Image for Product ${ product._id }: ${ product.images[0] }`);
    }
  });




  const total = cart.total
  const coupon = cart.coupon;
  const couponDiscount = cart.coupanDiscount
  const finalPrice = cart.payable
  let promocode = null;
  if (coupon) promocode = coupon.code
  else console.log(`Coupan does not exist`)
  // dasdasdas
  const ProductsInCart = null
  // sdasdasd
  const TotalBeforeCoupon = cart.offerDiscount
  await cart.save();
  const currentDate = new Date();
  const availableCoupon = await Coupon.find({
    minimumOrderAmount: { $lte: TotalBeforeCoupon },
    validUntil: { $gte: currentDate }
  });
  
  let wallet = await Wallet.findOne({user: req.session.user.id},{balance:1,_id:0}) 
  if(!wallet){
    wallet = 0
  }
  res.render('user/checkout', { addresses: addresses, user: user, coupons: availableCoupon, coupon: promocode, req, wishlistCount, cart, ProductsInCart, total, TotalBeforeCoupon, couponDiscount, totalAfterCoupon: finalPrice,wallet });
};



exports.checkCart = async (req, res) => {
  console.log(req.body);

  try {
    const productExistPromises = req.body.productIds.map(async (productId) => {
      const productExist = await Product.findOne({ _id: productId }, { _id: 1, isActive: 1 });
      return productExist;
    });

    const productExistResults = await Promise.all(productExistPromises);

    for (let i = 0; i < productExistResults.length; i++) {
      const productExist = productExistResults[i];

      if (!productExist || productExist.isActive === false) {
        return res.status(400).json({ message: 'One or more items are not available. Please refresh your cart.' });
      }
    }

    const stockAndNamePromises = req.body.productIds.map(async (productId, index) => {
      console.log(`Index is ${ index }`);
      return userSideMiddleware.getStockAndNameWithProductAndVarientId(productId, req.body.variantIds[index]);
    });

    const stockAndNameResults = await Promise.all(stockAndNamePromises);

    for (let i = 0; i < stockAndNameResults.length; i++) {
      const result = stockAndNameResults[i];
      console.log(`Result is : ${ result }`);
      console.log(`Result is | ${ result.stock }  req.body.quantity is | ${ req.body.quantities[i] }`);

      if (result.stock < req.body.quantities[i]) {
        return res.status(400).json({ message: `Stock not available for one or more items or product is currently unavailable` });
      }
    }

    return res.status(200).json({ success: false, message: 'redirecting you to next step' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
