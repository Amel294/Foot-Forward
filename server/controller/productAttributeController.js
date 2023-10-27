const Brand = require('../model/productAttribute/brandDB');
const Color = require('../model/productAttribute/colorDB');
const Size = require('../model/productAttribute/sizeDB');
const Category = require('../model/productAttribute/categoryDB');




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
        const color = new Color(req.body);
        await color.save();
        res.status(201).json(color);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a color
exports.deleteColor = async (req, res) => {
    try {
        const color = await Color.findByIdAndRemove(req.params.id);
        if (!color) return res.status(404).json({ message: 'Color not found' });
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
        const size = await Size.findByIdAndRemove(req.params.id);
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
      if (!size) return res.status(404).json({ message: 'Size not found' });

      size.value = Number(req.body.size); // Ensure the value is a number
      await size.save();

      res.status(200).json(size);
  } catch (err) {
      res.status(400).json({ message: err.message });
  }
};






// CATEGORIES (With Subcategories)





// Edit a subcategory within a category
exports.editSubCategory = async (req, res) => {
    try {
        const categoryType = req.params.categoryType;
        const category = await Category.findOne();

        if (!category) return res.status(404).json({ message: 'Category not found' });

        if (!["men", "women", "unisex"].includes(categoryType)) {
            return res.status(400).json({ message: 'Invalid category type' });
        }

        category[categoryType] = req.body.name;
        await category.save();

        res.status(200).json(category);
    } catch (err) {
        res.status(400).json({ message: err.message });
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
        return res.json(subcategories);
    } catch (err) {
        return res.status(500).json({ message: "Error fetching subcategories", error: err });
    }
};


exports.deleteSubcategory = async (req, res) => {
    try {
        const mainCategory = req.params.mainCategory;
        const subcategoryName = req.params.subcategoryName;

        // Find the document with the matching main category and subcategory
        const result = await Category.deleteOne({ 
            Category: mainCategory, 
            Subcategory: subcategoryName 
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }

        res.status(200).json({ message: 'Subcategory deleted successfully' });

    } catch (err) {
        console.error("Error deleting subcategory:", err);
        res.status(500).json({ message: err.message });
    }
};






