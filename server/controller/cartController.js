const Cart = require("../model/cart")
const ProductDB = require('../model/productDB');
const Order = require('../model/order')

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
      // Fetch the cart based on user session ID
      const cart = await Cart.findOne({ user: req.session.user.id });
      if (!cart) {
        return res.status(404).send('Cart not found.');
      }
  
      // Fetch each product and its variants
      for (let item of cart.items) {
        item.product = await ProductDB.findById(item.product);
        // Assuming 'variants' is an array in ProductDB, find the variant manually
        item.variant = item.product.variants.find(v => v._id.toString() === item.variant.toString());
      }
      console.log(cart)
      res.render('user/cart', { cart });
    } catch (error) {
      console.error('Error fetching the cart:', error);
      res.status(500).send('Error fetching the cart');
    }
  }


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
    const userId = req.session.user.id; // Assuming you have a session with user information

    // Get the selected address and payment method from the form data
    console.log(`The address is ${req.body.address}`);
    const { paymentMethod, address } = req.body;

    // Retrieve the user's cart based on the userId
    const userCart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!userCart || userCart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty or not found' });
    }

    // Create a new order using the cart data
    const order = new Order({
      user: userId,
      items: userCart.items,
      total: userCart.total,
      paymentMethod: paymentMethod,
      shippingAddress: address,
    });

    // Save the order to the database
    await order.save();

    // Clear the user's cart after placing the order (you may have a method for this in your Cart model)
    await userCart.clearCart();
    
    // Send a JSON response indicating the order was successfully placed
    res.status(200).json({ message: 'Order placed successfully' });

    // Redirect after a delay
    // Delay in milliseconds (1 second in this example)
  } catch (error) {
    // Handle any errors that occur during the process
    console.error('Error placing order:', error);
    return res.status(500).json({ error: 'Internal server error' });
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

exports.updateQuantity = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const itemId = req.params.itemId;
    const quantity = Math.min(10, Math.max(1, req.body.quantity));

    // First, find the cart for the user
    const userCart = await Cart.findOne({ user: userId });
    if (!userCart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    // Then, update the quantity of the item in the cart
    const updateResult = await Cart.updateOne(
      { 'user': userId, 'items._id': itemId },
      { '$set': { 'items.$.quantity': quantity } }
    );

    // If the item quantity was updated, recalculate the cart total
    if (updateResult.modifiedCount > 0) {
      await calculateCartTotal(userCart._id); // Pass the cart ID instead of the user ID
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating item quantity:', error);
    res.status(500).json({ success: false, message: 'Failed to update quantity' });
  }
}

async function calculateCartTotal(cartId) {
  const cart = await Cart.findById(cartId).populate('items.product');
  if (!cart) return;

  let total = 0;
  for (const item of cart.items) {
    console.log(`Price: ${ item.product.price }, Quantity: ${ item.quantity }`); // Add this line for debugging
    total += item.product.price * item.quantity;
  }

  console.log(`Total: ${ total }`); // Add this line for debugging
  cart.total = total;
  await cart.save();
}



exports.addToCart =async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { productId, variantId, quantity } = req.body;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId && item.variant.toString() === variantId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, variant: variantId, quantity });
    }

    await cart.save();
    await calculateCartTotal(cart._id);
    res.status(200).send('Item added to cart');
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).send('Error adding to cart');
  }
}

exports.removeFromCart =async (req, res) => {
  try {
    const userId = req.session.user.id;
    const itemId = req.params.itemId;

    // Find the cart, remove the item, and return the updated cart
    const updatedCart = await Cart.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { _id: itemId } } },
      { new: true } // This option returns the updated document
    );

    // If the cart is not found, send an error response
    if (!updatedCart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    // Recalculate the cart total using the cart ID
    await calculateCartTotal(updatedCart._id);

    // Send back the updated total
    res.json({ success: true, total: updatedCart.total });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ success: false, message: 'Failed to remove item' });
  }
}

exports.itemsInCart = async (req, res) => {
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