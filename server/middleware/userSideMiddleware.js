const Wishlist = require("../model/wishlist")
const Cart = require("../model/cart")
const productDB = require("../model/productDB")
const mongoose = require('mongoose');
const { name } = require("ejs");
const { Schema, ObjectId } = mongoose;

exports.isUserLogged = (req, res, next) => {

  if (req.session.user && req.session.user.isActive) {
    // User is authenticated and active, allow access to other routes
    next();
  } else {
    // Redirect unauthenticated or inactive users to the root route
    res.redirect('/signin');
  }
}

exports.getWishlistCountOfUser = async function getWishlistCounts(userId) {
  try {
    const aggregationPipeline = [
      {
        $match: { user: userId }, // Match wishlists for a specific user
      },
      {
        $project: {
          productCount: { $size: '$products' }, // Calculate the product count
        },
      },
    ];

    const results = await Wishlist.aggregate(aggregationPipeline);
    console.log(`Result is ${ results }`)
    const totalWishlistCount = results.length; // Count of wishlists

    // Calculate the total product count by summing up product counts of all wishlists
    const totalProductCount = results.reduce((total, wishlist) => total + wishlist.productCount, 0);

    return {
      totalWishlistCount,
      totalProductCount,
    };
  } catch (error) {
    console.error('Error fetching wishlist counts:', error);
    throw new Error('Failed to fetch wishlist counts');
  }
}


exports.getStockWithProductAndVarientId = async function getVariantStock(productId, variantId) {
  const pipeline = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(productId)
      }
    },
    {
      $project: {
        variants: {
          $filter: {
            input: "$variants",
            as: "variant",
            cond: {
              $eq: ["$$variant._id", new mongoose.Types.ObjectId(variantId)]
            }
          }
        }
      }
    },
    {
      $unwind: "$variants"
    },
    {
      $project: {
        stock: "$variants.stock"
      }
    }
  ];

  const result = await productDB.aggregate(pipeline);
  console.log(`Result is  | ${result[0].stock}`)
  if (result && result.length > 0) {
    return result[0].stock;
  } else {
    // Handle the case where the product or variant is not found
    throw new Error('Product or variant not found');
  }
}

exports.getStockAndNameWithProductAndVarientId = async function getVariantStock(productId, variantId) {
  const pipeline = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(productId)
      }
    },
    {
      $project: {
        offerPrice : "$offerPrice",
        price: "$price",
        variants: {
          $filter: {
            input: "$variants",
            as: "variant",
            cond: {
              $eq: ["$$variant._id", new mongoose.Types.ObjectId(variantId)]
            }
          }
        },
        name: "$name", // Add this line to project the "name" field
      }
    },
    {
      $unwind: "$variants"
    },
    {
      $project: {
        offerPrice : "$offerPrice",
        price: "$price",
        stock: "$variants.stock",
        color: "$variants.color",
        size: "$variants.size",
        name: "$name" 
      }
    }
  ];

  const result = await productDB.aggregate(pipeline);
  console.log(`Name is ${result[0].price}`);
  if (result && result.length > 0) {
    return result[0];
  } else {
    // Handle the case where the product or variant is not found
    throw new Error('Product or variant not found');
  }
}

exports.getQtyIfAlreadyAdded = async function getQtyIfAlreadyAdded(productId, variantId) {
  const cart = await Cart.findOne({
    'items': {
      $elemMatch: {
        'product': new mongoose.Types.ObjectId(productId),
        'variant': new mongoose.Types.ObjectId(variantId)
      }
    }
  }, { 'items.$': 1 });

  let quantityInCart = 0;

  if (cart && cart.items && cart.items.length > 0) {
    quantityInCart = cart.items[0].quantity;
  }

  console.log("Quantity in cart:", quantityInCart);
  return quantityInCart
} 