const Product = require("../models/productModel");
const CreateError = require("../utils/createError");

// POST @ /api/v1/product
// @desc only admin can add new product in database

exports.newProduct = async (req, res, next) => {
  try {
    if (!req.user.isAdmin)
      return next(
        new CreateError("You have to be admin in order to add products", 403)
      );

    const newProduct = await Product.create(req.body);
    res.status(201).json({
      status: "success",
      data: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH @ api/v1/product/:id
// @desc only admin can update a product

exports.updateProduct = async (req, res, next) => {
  try {
    if (req.user.isAdmin) {
      if (!(await Product.findOne({ _id: req.params.id })))
        return next(new CreateError("No product found with this ID", 404));

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json({
        status: "success",
        updatedProduct,
      });
    } else {
      return next(new CreateError("You are not allowed to do that!", 403));
    }
  } catch (error) {
    next(error);
  }
};

// DELETE @ api/v1/product/:id
// @desc only admin can delete a product

exports.deleteProduct = async (req, res, next) => {
  try {
    if (req.user.isAdmin) {
      const deletedProduct = await Product.deleteOne({ _id: req.params.id });

      //   console.log(deletedProduct.deletedCount);

      if (deletedProduct.deletedCount === 0)
        return next(new CreateError("Product with this id doesn't exist", 404));

      res.status(200).json({
        status: "success",
        msg: "product deleted",
      });
    }
  } catch (error) {
    next(error);
  }
};

// // GET @ /api/v1/product/
// // @desc fetch all the products

exports.getAllProducts = async (req, res, next) => {
  try {
    // Filter the newest document
    const queryNew = req.query.new;
    const queryCategory = req.query.category;

    let products;

    if (queryNew) {
      products = await Product.find({}).sort({ createdAt: -1 }).limit(2);
    } else if (queryCategory) {
      products = await Product.find({
        categories: { $in: [queryCategory] },
      });
    } else {
      products = await Product.find({});
    }

    res.status(200).json({
      status: "success",
      results: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// GET @ /api/v1/product/:id
// @desc fetch a particular product

exports.getAProduct = async (req, res, next) => {
  try {
    const data = await Product.findOne({ _id: req.params.id });

    if (!data)
      return next(new CreateError(`Product with this id doesn't exist`, 404));

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};
