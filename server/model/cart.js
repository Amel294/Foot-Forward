const mongoose = require('mongoose');
const { Schema, ObjectId } = mongoose;
const Product = require('./productDB');
const couponDB = require("../model/coupon");

const cartSchema = new Schema(
  {
    user: {
      type: ObjectId,
      ref: 'User',
      required: true
    },
    items: [
      {
        product: {
          type: ObjectId,
          ref: 'ProductDB',
          required: true
        },
        variant: {
          type: ObjectId,
          ref: 'ProductDB.variants',
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity cannot be less than 1.'],
          max: [10, 'Quantity cannot be more than 10.']
        },
        color: {
          type: ObjectId,
          ref: 'Color',
        },
        size: {
          type: ObjectId,
          ref: 'Size',
          required: true
        },
        itemTotal:{
          type:Number,
        },
        discountedPrice :{
          type:Number,
        }
      }
    ],
    total: {
      type: Number,
      default: 0
    },
    offerDiscount: {
      type: Number,
      default: 0
    },
    totalAfterOffer: {
      type: Number,
    },
    coupon: {
      type: ObjectId,
      ref: 'Coupon',
    },
    coupanDiscount: {
      type: Number,
      default: 0
    },
    payable: {
      type: Number
    }
  },
  {
    strictPopulate: false
  }
);

cartSchema.pre('save', async function (next) {
  try {
    this.total = 0;
    this.offerDiscount = 0;
    this.coupanDiscount = 0;

    for (const item of this.items) {
      const product = await Product.findOne({ _id: item.product }).populate('offer.hasOffer offer.offerPrice offer.offerPercent price variants.color variants.size');
      
      if (product) {
        this.total += product.price * item.quantity;
        item.itemTotal = product.price * item.quantity;

        if (product.offer.hasOffer === true) {
          this.offerDiscount += product.offer.offerPrice * item.quantity;
          item.discountedPrice = product.offer.offerPrice * item.quantity
        } else {
          console.log(`No offer for product ${item.product.name}`);
        }
      } else {
        console.error('Product price not found for product ID:', item.product);
      }
    }

    this.totalAfterOffer = this.total - this.offerDiscount;

    if (this.coupon) {
      const coupon = await couponDB.findOne({ _id: this.coupon });

      if (coupon) {
        if (coupon.type === "Percent") {
          this.coupanDiscount = this.totalAfterOffer * (coupon.discount / 100);
        } else {
          console.log(`Flat rate discount is ${coupon.discount}`)
          this.coupanDiscount = coupon.discount;
        }
      } else {
        console.error("Coupon not found");
      }
    }

    this.payable = this.totalAfterOffer - this.coupanDiscount;

  } catch (error) {
    console.error('Error in cart pre-save middleware:', error);
    return next(error);
  }

  next();
});


cartSchema.methods.removeItem = async function (itemId, userId) {
  console.log(`Item id in method is : ${itemId}`)
  console.log(`user id in method is : ${userId}`)
  try {
    // Find the cart that needs to be updated
    const updatedCart = await Cart.findOne({user: userId });

    if (!updatedCart) {
      console.error('Cart not found for removal:', itemId);
      return;
    }

    // Find the item index in the cart items array
    const itemIndex = updatedCart.items.findIndex(item => item._id.equals(itemId));

    if (itemIndex !== -1) {
      const removedItem = updatedCart.items[itemIndex];
      const product = await Product.findOne({ _id: removedItem.product }).populate('offer.hasOffer offer.offerPrice offer.offerPercent price variants.color variants.size');

      if (product) {
        // Update total and offer discount based on the removed item
        updatedCart.total -= removedItem.itemTotal;

        if (product.offer.hasOffer === true) {
          updatedCart.offerDiscount -= removedItem.itemTotal;
        }

        // Remove the item from the items array
        updatedCart.items.splice(itemIndex, 1);

        // Recalculate total after offer and payable amount
        updatedCart.totalAfterOffer = updatedCart.total - updatedCart.offerDiscount;
        updatedCart.payable = updatedCart.totalAfterOffer - updatedCart.coupanDiscount;

        // Save the updated cart
        await updatedCart.save();

        console.log(`Item removed successfully from the cart. Cart ID: ${itemId}`);
      } else {
        console.error('Product not found for removal:', removedItem.product);
      }
    } else {
      console.error('Item not found in the cart:', itemId);
    }
  } catch (error) {
    console.error('Error removing item from cart:', error);
    throw error;
  }
};




cartSchema.methods.clearCart = async function () {
  this.items = [];
  this.total = 0;
  await this.save();
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
