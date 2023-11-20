const Wishlist = require("../model/wishlist")

exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.session.user ? req.session.user.id : null;

    if (!userId) {
      // User is not authenticated
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      // Wishlist not found
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    // Check if the product exists in the wishlist
    if (!wishlist.products.includes(productId)) {
      // Product is not in the wishlist
      return res.status(400).json({ error: 'Product is not in the wishlist' });
    }

    // Remove the product from the wishlist
    wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
    await wishlist.save();

    // Product removed from the wishlist successfully
    return res.status(200).json({ message: 'Product removed from wishlist' });
  } catch (error) {
    console.error('Error:', error);

    // Internal server error occurred
    return res.status(500).json({ error: 'Internal server error' });
  }
};


  exports.addToWishlist = async (req, res) => {
    try {
      const productId = req.params.productId;
      const userId = req.session.user ? req.session.user.id : null;
  
      if (!userId) {
        // User is not authenticated
        return res.status(401).json({ error: 'User not authenticated' });
      }
  
      // Check if the product already exists in the wishlist
      const wishlist = await Wishlist.findOne({ user: userId });
  
      if (!wishlist) {
        // Create a new wishlist if it doesn't exist
        const newWishlist = new Wishlist({
          user: userId,
          products: [productId],
        });
        await newWishlist.save();
  
        // Wishlist created successfully
        return res.status(201).json({ message: 'Wishlist created and product added' });
      } else {
        // Check if the product is already in the wishlist
        if (wishlist.products.includes(productId)) {
          // Product is already in the wishlist
          return res.status(400).json({ error: 'Product already in the wishlist' });
        }
  
        // Add the product to the existing wishlist
        wishlist.products.push(productId);
        await wishlist.save();
  
        // Product added to the wishlist successfully
        return res.status(200).json({ message: 'Product added to wishlist' });
      }
    } catch (error) {
      console.error('Error:', error);
  
      // Internal server error occurred
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
  