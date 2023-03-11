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
    const queryString = req.query.new;

    const data = queryString
      ? await Product.find({}).limit(1).sort({ _id: -1 })
      : await Product.find({});

    res.status(200).json({
      status: "success",
      results: data.length,
      data,
    });
  } catch (error) {
    next(error)
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
    next(error)
  }
};

// // GET @ api/v1/user/stats
// // @desc get number of users registered in each month for past one year

// exports.getUserStats = async (req, res, next) => {
//   const currentDate = new Date();
//   const lastYear = new Date(
//     currentDate.setFullYear(currentDate.getFullYear() - 1)
//   );
//   try {
//     if (!req.user.isAdmin)
//       return next(
//         new CreateError(
//           "you have to login as an admin to access this route",
//           403
//         )
//       );

//     const data = await Product.aggregate([
//       {
//         $match: { createdAt: { $gte: lastYear } },
//       },
//       {
//         $project: { month: { $month: "$createdAt" } },
//       },
//       {
//         $group: {
//           _id: "$month",
//           total: { $sum: 1 },
//         },
//       },
//     ]);

//     res.status(200).json({
//       status: "success",
//       data,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
