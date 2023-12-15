const Cart = require("../model/cart")
const ProductDB = require('../model/productDB');
const Order = require('../model/order')
const userSideMiddleware = require("../middleware/userSideMiddleware")
const CouponsDB = require("../model/coupon")
const mongoose = require('mongoose');
const Address = require("../model/address");
const Color = require("../model/productAttribute/colorDB")
const Size = require("../model/productAttribute/sizeDB");
const Wallet = require("../model/wallet");
exports.cartTotal = async (req, res) => {
  try {
    // Assuming `Cart` is your Mongoose model for the cart collection
    const cart = await Cart.findOne({ user: req.session.user.id }); // Find the cart for the current user
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    // Send the total as a response
    res.json({ total: cart.total });
  } catch (error) {
    console.error('Error fetching cart total:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.getCartPage = async (req, res) => {
  try {
    const wishlistCount = userSideMiddleware.getWishlistCountOfUser(req.session.user.id);

    // Fetch the cart based on user session ID
    let cart = await Cart.findOne({ user: req.session.user.id }).populate('items.product  items.color items.size total price');
    if (!cart) {
      cart = new Cart({ user: req.session.user.id, items: [], total: 0, price: 0 });
      await cart.save();
    }

    console.log(cart);
    if (!cart) {
      return res.status(404).send('Cart not found.');
    }

    console.log(cart)

    for (const item of cart.items) {
      try {
        const product = await ProductDB.findOne({ _id: item.product });
        if (product) {
          const variant = product.variants.find(v => v._id.toString() === item.variant.toString());
          if (variant) {
            const stock = variant.stock;
            console.log(`Variant: ${ variant._id }, Stock: ${ stock }`);
            if (item.quantity > stock) {
              item.outOfStock = true;
            }
          } else {
            console.log(`Variant with ID ${ item.variant } not found for product ${ item.product }`);
          }
        } else {
          console.log(`Product with ID ${ item.product } not found`);
        }
      } catch (error) {
        console.error(`Error finding stock for item: ${ error.message }`);
      }
    }


    res.render('user/cart', { cart, req, wishlistCount, });
  } catch (error) {
    console.error('Error fetching the cart:', error);
    res.status(500).send('Error fetching the cart');
  }
};




exports.itemCount = async (req, res) => {
  try {
    console.log("Im here");
    // Assuming you have a middleware that sets req.user to the logged-in user's info
    if (!req.session.user.id) {
      return res.status(401).json({ message: "User is not authenticated." });
    }
    console.log("Im here");
    // Find the cart for the logged-in user
    const cart = await Cart.findOne({ user: req.session.user.id });
    if (!cart) {
      return res.status(200).json({ count: 0 }); // No cart means 0 items
    }
    console.log("Im here");
    // Calculate the total number of items in the cart
    const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);

    // Respond with the count
    res.status(200).json({ count: itemCount });
  } catch (error) {
    console.error('Error getting cart items count:', error);
    res.status(500).json({ message: "Internal server error." });
  }
}

exports.placeOrder = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.session.user.id); // Convert userId to ObjectId
    const { paymentMethod, address, paymentId } = req.body;

    
    console.log(paymentMethod);
    const shippingAddress = await Address.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(address) }
      },
      {
        $project: {
          _id: 0,
          street: '$address.street',
          city: '$address.city',
          state: '$address.state',
          zipCode: '$address.zipCode'
        }
      }
    ]);
    console.log(shippingAddress[0].street);

    const userCart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!userCart || userCart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty or not found' });
    }
    console.log(userCart)
    let order;

    if (paymentMethod === "PayOnline") {
      console.log(`Inside PayOnline payment`);
      order = new Order({
        user: userId,
        items: userCart.items,
        total: userCart.total,
        offerDiscount: userCart.offerDiscount,
        couponDiscount: userCart.coupanDiscount,
        payable: userCart.payable,
        paymentMethod: paymentMethod,
        shippingAddress: {
          street: shippingAddress[0].street,
          city: shippingAddress[0].city,
          state: shippingAddress[0].state,
          zipCode: shippingAddress[0].zipCode
        },
      });
      console.log(`Data received ${ order }`)
    }

    if (paymentMethod === "COD") {
      console.log(`Inside COD payment`);
      order = new Order({
        user: userId,
        items: userCart.items,
        total: userCart.total,
        offerDiscount: userCart.offerDiscount,
        couponDiscount: userCart.coupanDiscount,
        payable: userCart.payable,
        paymentMethod: paymentMethod,
        shippingAddress: {
          street: shippingAddress[0].street,
          city: shippingAddress[0].city,
          state: shippingAddress[0].state,
          zipCode: shippingAddress[0].zipCode
        },
      });
    }

    if (paymentMethod === "Wallet") {
      console.log(`Inside Wallet payment`);
      const wallet = await Wallet.findOne({ user: userId });

      if (wallet.balance < userCart.payable) {
        return res.status(400).json({ error: 'Insufficient balance in the wallet' });
      }

      order = new Order({
        user: userId,
        items: userCart.items,
        total: userCart.total,
        offerDiscount: userCart.offerDiscount,
        couponDiscount: userCart.coupanDiscount,
        payable: userCart.payable,
        paymentMethod: paymentMethod,
        shippingAddress: {
          street: shippingAddress[0].street,
          city: shippingAddress[0].city,
          state: shippingAddress[0].state,
          zipCode: shippingAddress[0].zipCode
        },
      });



    }

    if (!order) {
      return res.status(500).json({ error: 'Failed to create order' });
    }

    // Assign unique order IDs to each item
    await assignUniqueOrderIDs(order.items);

    // Save the order and clear the cart
    await order.save();


    if (paymentMethod === "Wallet") {
      console.log(`Inside Wallet payment`);
      const wallet = await Wallet.findOne({ user: userId });

      if (wallet.balance < userCart.payable) {
        return res.status(400).json({ error: 'Insufficient balance in the wallet' });
      }
      wallet.balance -= userCart.payable;
      wallet.transactions.push({
        description: `Order Payment for orderID: ${ order._id }`,
        amount: -userCart.payable,
        type: 'Dr',
      });

      await wallet.save();

    }
    await userCart.clearCart();

    res.status(200).json({ message: 'Order placed successfully' });
  } catch (error) {
    console.error('Error placing order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};



async function assignUniqueOrderIDs(items) {
  for (const item of items) {
    let isUnique = false;
    while (!isUnique) {
      const generatedOrderID = generateOrderID();
      const existingOrder = await Order.findOne({ 'items.orderID': generatedOrderID });
      if (!existingOrder) {
        item.orderID = generatedOrderID;
        isUnique = true;
      }
    }
  }
}

let orderCounter = 0;

function generateOrderID() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2); // Last two digits of the year
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month as two digits
  const day = date.getDate().toString().padStart(2, '0'); // Day as two digits

  // Increment and format the counter part
  orderCounter = (orderCounter + 1) % 1000; // Resets every 1000
  const counterPart = orderCounter.toString().padStart(3, '0');

  return `ODR${ year }${ month }${ day }${ counterPart }`;
}









exports.updateQuantity = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const itemId = req.params.itemId;
    const variantId = req.params.variantId;
    const buttonClicked = req.params.buttonClicked;
    const requestedQuantityChange = buttonClicked === "minus" ? -1 : 1;

    // Find the cart and item
    const userCart = await Cart.findOne({ user: userId, 'items._id': itemId });
    if (!userCart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const cartItem = userCart.items.find(item => item._id.equals(itemId));
    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    // Get current stock for the product variant
    const product = await ProductDB.findOne({ 'variants._id': variantId }, { 'variants.$': 1 });
    if (!product || !product.variants.length) {
      return res.status(404).json({ success: false, message: 'Variant not found' });
    }
    const variantStock = product.variants[0].stock;

    // Calculate the new quantity and validate against limits
    let newQuantity = cartItem.quantity + requestedQuantityChange;
    if (newQuantity < 1 || newQuantity > 10) {
      return res.status(400).json({ success: false, message: 'Quantity must be between 1 and 10' });
    }
    let hasStock = false
    // If the update is a "plus," check for stock
    if (buttonClicked === "plus" && newQuantity > variantStock) {
      hasStock = true;
      return res.status(400).json({ success: false, message: 'Insufficient stock available' });
    }

    // Update quantity in cart
    cartItem.quantity = newQuantity;

    await userCart.save();


    // Recalculate cart total and respond
    let temp = await ProductDB.findOne({ _id: cartItem.product }, { price: 1, _id: 0 })
    const newPrice = temp.price;
    console.log(`New cart price is ${ newPrice * newQuantity }`)
    const discount = userCart.offerDiscount
    const cartTotal = userCart.total
    const grandTotal = userCart.totalAfterOffer
    const total = userCart.total
    res.json({ success: true, message: 'Quantity updated successfully', hasStock, newTotal: userCart.total, newTotal: newPrice * newQuantity, discount, grandTotal, cartTotal, total });
  } catch (error) {
    console.error('Error updating item quantity:', error);
    res.status(500).json({ success: false, message: 'Failed to update quantity' });
  }
};







exports.addToCart = async (req, res) => {
  try {
    console.log("In add to cart")
    const userId = req.session.user.id;
    const { productId, variantId, quantity, color, size } = req.body;
    const stock = await userSideMiddleware.getStockWithProductAndVarientId(productId, variantId)
    const qtyinCart = await userSideMiddleware.getQtyIfAlreadyAdded(productId, variantId)

    if (qtyinCart + quantity > 10) {
      return res.status(400).send('Cannot add more than 10 products');
    }
    if (qtyinCart + quantity > stock) {
      console.log("Cannot be added to cart: Insufficient stock");
      return res.status(400).send('Cannot add to cart: Insufficient stock');
    }

    console.log(`Stock is: ${ stock }, Qty in cart is: ${ qtyinCart }`);

    console.log(`Stock is : ${ stock }
    Qty in cart is : ${ qtyinCart }`)
    if (quantity > stock) {
      error
    }
    console.log(stock)
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId && item.variant.toString() === variantId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, variant: variantId, quantity, color, size });
    }

    await cart.save();
    res.status(200).send('Item added to cart');
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).send('Error adding to cart');
  }
}


exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const itemId = req.params.itemId;

    // Find the cart instance based on userId and itemId
    const cartInstance = await Cart.findOne({ user: userId, 'items._id': itemId });

    if (cartInstance) {
      await cartInstance.removeItem(itemId, userId);
      console.log('Item removed successfully!');
      const cart = await Cart.findOne({ user: req.session.user.id })
      console.log(`Updated caet details are : ${ cart }`)
      const discount = cart.offerDiscount
      const grandTotal = cart.totalAfterOffer
      const total = cart.total
      console.log(`Cart total in remove is ${ total }`)

      res.status(200).json({ success: true, message: 'Item removed successfully', discount, grandTotal, total });
    } else {
      console.error('Cart not found for user:', userId);
      res.status(404).json({ success: false, message: 'Cart not found for user' });
    }
  } catch (error) {
    console.error('Error while removing item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.itemsInCart = async (req, res) => {
  try {
    if (!req.session.user.id) {
      return res.status(401).json({ message: "User is not authenticated." });
    }
    // Find the cart for the logged-in user
    const cartCount = await Cart.countDocuments({ user: req.session.user.id });
    if (!cartCount) {
      return res.status(200).json({ count: 0 }); // No cart means 0 items
    }
    res.status(200).json({ count: cartCount });
  } catch (error) {
    console.error('Error getting cart items count:', error);
    res.status(500).json({ message: "Internal server error." });
  }
}