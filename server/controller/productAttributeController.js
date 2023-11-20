const Brand = require('../model/productAttribute/brandDB');
const Color = require('../model/productAttribute/colorDB');
const Size = require('../model/productAttribute/sizeDB');
const Category = require('../model/productAttribute/categoryDB');
const Product  = require('../model/productDB')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId; // Use mongoose.Types.ObjectId



// BRANDS

// Add a new brand
exports.addBrand = async (req, res) => {
  console.log(req.body)
    try { 
      const brand = new Brand({ name: req.body.name });
        await brand.save();
        res.status(201).json(brand);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Edit an existing brand
exports.editBrand = async (req, res) => {
    try {
        const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!brand) return res.status(404).json({ message: 'Brand not found' });
        res.status(200).json(brand);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a brand
exports.deleteBrand = async (req, res) => {
    try {
        const brand = await Brand.findByIdAndRemove(req.params.id);
        if (!brand) return res.status(404).json({ message: 'Brand not found' });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.getAllBrands = async (req, res) => {
  try {
      const brands = await Brand.find(); // Assuming you have a Brand model
      res.status(200).json(brands);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};

exports.getBrandById = async (req, res) => {
  try {
      const brand = await Brand.findById(req.params.id);
      if (!brand) return res.status(404).json({ message: 'Brand not found' });
      res.status(200).json(brand);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};

// COLORS

// Add a new color
exports.addColor = async (req, res) => {
    try {
        const color = req.body.name;
        const hex = req.body.hex;
        console.log(color);
        console.log(hex);
        const existingColor = await Color.findOne({
            $or: [{ name: color }, { hexCode: hex }]
        });
        if (existingColor) {
            return res.status(400).json({
                message: 'Color name or HEX code already exists.'
            });
        }
        const newColor = new Color({ name: color, hex: hex }); // Use name and hexCode properties

        await newColor.save(); // Save the newColor object
        res.status(201).json(newColor);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};




// Delete a color
exports.deleteColor = async (req, res) => {
    try {
        const colorId = req.params.id;
        const color = await Color.findById(colorId);

        if (!color) {
            return res.status(404).json({ message: 'Color not found' });
        }

        await Color.findByIdAndUpdate(colorId, { $set: { isDeleted: true } });
        
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



exports.getAllColors = async (req, res) => {
  try {
      const colors = await Color.find();
      res.status(200).json(colors);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};

exports.getColorById = async (req, res) => {
  try {
      const color = await Color.findById(req.params.id);
      if (!color) return res.status(404).json({ message: 'Color not found' });
      res.status(200).json(color);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};


exports.updateColor = async (req, res) => {
  console.log("Entered update color");
  try {
      const color = await Color.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!color) return res.status(404).json({ message: 'Color not found' });
      res.status(200).json(color);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};


// SIZES

// Add a new size
exports.addSize = async (req, res) => {
    try {
      const sizeValue = Number(req.body.size);
      const size = new Size({ value: sizeValue });      
        await size.save();
        res.status(201).json(size);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getAllSizes = async (req, res) => {
  try {
      const sizes = await Size.find();
      res.status(200).json(sizes);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};

exports.getSizeById = async (req, res) => {
  try {
      const size = await Size.findById(req.params.id);
      if (!size) return res.status(404).json({ message: 'Size not found' });
      res.status(200).json(size);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};


// Delete a size
exports.deleteSize = async (req, res) => {
    try {
        // Check if the size is associated with any products
        const isSizeUsedInProducts = await Product.exists({ 'variants.size': req.params.id });

        if (isSizeUsedInProducts) {
            const associatedProducts = await Product.find({ 'variants.size': req.params.id }, 'productId');
            const productIds = associatedProducts.map(product => product.productId);
            console.log(`Can't delete size associated with products: ${productIds.join(', ')}`);
            return res.status(400).json({
                message: `Can't delete size associated with products: ${productIds.join(', ')}`
            });
        }

        // If no associated products, proceed with deleting the size
        const size = await Size.findByIdAndUpdate(
            req.params.id,
            { $set: { isDeleted: true } },
        );

        if (!size) {
            return res.status(404).json({ message: 'Size not found' });
        }

        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};




exports.restoreSize = async (req, res) => {
    try {
        const size = await Size.findByIdAndUpdate(
            req.params.id,
            { $set: { isDeleted: false } },
            { new: true }
        );

        if (!size) return res.status(404).json({ message: 'Size not found' });

        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



// Edit an existing size
exports.updateSize = async (req, res) => {
  try {
      const size = await Size.findById(req.params.id);
      const newValue  =  req.params.newValue;
      console.log(newValue)
      if (!size) return res.status(404).json({ message: 'Size not found' });
      await Size.findByIdAndUpdate(
        req.params.id,
        { $set: { value: newValue } },
    );

      res.status(200).json(newValue);
  } catch (err) {
      res.status(400).json({ message: err.message });
  }
};






// CATEGORIES (With Subcategories)





// Edit a subcategory within a category
exports.editSubCategory = async (req, res) => {
    try {
        const categoryID = req.params.categoryID;
        const newValue = req.params.value;
        console.log(`Category id is: ${categoryID}`);

        // Check if any products are associated with this category
        const associatedProducts = await Product.find({'subcategory': categoryID}, 'productId');
        
        if (associatedProducts.length > 0) {
            // List the IDs of products associated with this category
            const productIds = associatedProducts.map(product => product.productId);
            console.log(`Can't edit category as it is associated with products: ${productIds.join(', ')}`);
            return res.status(400).json({
                message: `Can't edit category as it is associated with products: ${productIds.join(', ')}`
            });
        }

        const category = await Category.findOne({_id: categoryID});
        if (!category) return res.status(404).json({ message: 'Category not found' });

        await Category.findByIdAndUpdate(categoryID, { $set: { Subcategory: newValue } });
        res.status(200).json(category);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Delete a subcategory from a category
exports.deleteSubCategory = async (req, res) => {
    try {
        const categoryType = req.params.categoryType;
        const category = await Category.findOne();

        if (!category) return res.status(404).json({ message: 'Category not found' });

        if (!["men", "women", "unisex"].includes(categoryType)) {
            return res.status(400).json({ message: 'Invalid category type' });
          }
          // remove the subcategory
          category[categoryType] = undefined;
          await category.save();
  
          res.status(204).send(); // Successfully removed, but no content to send back
      } catch (err) {
          res.status(400).json({ message: err.message });
      }
  };
  
  // Add a category
  exports.addCategory = async (req, res) => {
    try {
        // Check if the category document exists
        let category = await Category.findOne();

        // If it doesn't exist, initialize it
        if (!category) {
            category = new Category({
                men: [],
                women: [],
                unisex: []
            });
            await category.save();
        }

        // ... rest of the logic to add a category (if applicable)

        res.status(201).json(category);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

  
  // Edit a category (though it might be rare to edit a whole category)
  exports.editCategory = async (req, res) => {
    try {
        const CategoryID = req.params.id;

        // Check if the category is associated with any products
        const isCategoryUsedInProducts = await Product.exists({ 'subcategory': CategoryID });

        if (isCategoryUsedInProducts) {
            const associatedProducts = await Product.find({ 'subcategory': CategoryID });
            const productIds = associatedProducts.map(product => product.productId);
            console.log(`Can't edit category associated with products: ${productIds.join(', ')}`);
            return res.status(400).json({
                message: `Can't edit Category associated with products: ${productIds.join(', ')}`
            });
        }

        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.status(200).json(category);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

  
  // Delete a category
  exports.deleteCategory = async (req, res) => {
      try {
          const category = await Category.findByIdAndRemove(req.params.id);
          if (!category) return res.status(404).json({ message: 'Category not found' });
          res.status(204).send();
      } catch (err) {
          res.status(500).json({ message: err.message });
      }
  };
  

  exports.addSubCategory = (req, res) => {
    // Destructuring the request body to extract Category and Subcategory values
    const { Category: categoryValue, Subcategory } = req.body;

    // Creating a new instance of the Category model with the extracted data
    const newCategory = new Category({
        Category: categoryValue,
        Subcategory
    });

    // Save the category to the database
    newCategory.save()
      .then((doc) => {
        res.status(201).json({
          message: 'Category saved successfully',
          data: doc
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: 'Error saving category',
          error: err.message
        });
      });
};


exports.getSubCategory = async (req, res) => {
    const mainCategory = req.params.mainCategory;

    try {
        const subcategories = await Category.find({ Category: mainCategory });
        console.log(subcategories)
        return res.json(subcategories);
       
    } catch (err) {
        return res.status(500).json({ message: "Error fetching subcategories", error: err });
    }
};


exports.deleteSubcategory = async (req, res) => {
    try {
        const subcategoryId = req.params.subcategoryId;

        // Check if the subcategory is associated with any products
        const associatedProducts = await Product.find({ 'subcategory': subcategoryId }, 'productId');

        if (associatedProducts.length > 0) {
            // List the IDs of products associated with this subcategory
            const productIds = associatedProducts.map(product => product.productId);
            console.error(`Can't delete subcategory as it is associated with products: ${productIds.join(', ')}`);
            return res.status(400).json({
                message: `Can't delete subcategory as it is associated with products: ${productIds.join(', ')}`
            });
        }

        // Proceed with deletion if no associated products
        const result = await Category.deleteOne({ _id: subcategoryId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }

        res.status(200).json({ message: 'Subcategory deleted successfully' });

    } catch (err) {
        console.error("Error deleting subcategory:", err);
        res.status(500).json({ message: err.message });
    }
};







