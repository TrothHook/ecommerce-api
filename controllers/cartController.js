const Cart = require("../models/cartModel");
const CreateError = require("../utils/createError");

// POST @ /api/v1/cart
// @desc only registered user can add new cart in database

exports.newProduct = async (req, res, next) => {
  try {
    if (!req.user.id)
      return next(
        new CreateError("You have to be admin in order to add products", 403)
      );

    const newProduct = await Cart.create(req.body);
    res.status(201).json({
      status: "success",
      data: newProduct
    });
  } catch (error) {
    next(error);
  }
};

// // PATCH @ api/v1/cart/:id
// // @desc only admin can update a cart

// exports.updateProduct = async (req, res, next) => {
//   try {
//     if (req.user.isAdmin) {
//       if (!(await Cart.findOne({ _id: req.params.id })))
//         return next(new CreateError("No cart found with this ID", 404));

//       const updatedProduct = await Cart.findByIdAndUpdate(
//         req.params.id,
//         {
//           $set: req.body,
//         },
//         { new: true }
//       );
//       res.status(200).json({
//         status: "success",
//         updatedProduct,
//       });
//     } else {
//       return next(new CreateError("You are not allowed to do that!", 403));
//     }
//   } catch (error) {
//     next(error);
//   }
// };

// // DELETE @ api/v1/cart/:id
// // @desc only admin can delete a cart

// exports.deleteProduct = async (req, res, next) => {
//   try {
//     if (req.user.isAdmin) {
//       const deletedProduct = await Cart.deleteOne({ _id: req.params.id });

//       //   console.log(deletedProduct.deletedCount);

//       if (deletedProduct.deletedCount === 0)
//         return next(new CreateError("Cart with this id doesn't exist", 404));

//       res.status(200).json({
//         status: "success",
//         msg: "cart deleted",
//       });
//     }
//   } catch (error) {
//     next(error);
//   }
// };

// // // GET @ /api/v1/cart/
// // // @desc fetch all the products

// exports.getAllProducts = async (req, res, next) => {
//   try {
//     // Filter the newest document
//     const queryNew = req.query.new;
//     const queryCategory = req.query.category;

//     let products;

//     if (queryNew) {
//       products = await Cart.find({}).sort({ createdAt: -1 }).limit(2);
//     } else if (queryCategory) {
//       products = await Cart.find({
//         categories: { $in: [queryCategory] },
//       });
//     } else {
//       products = await Cart.find({});
//     }

//     res.status(200).json({
//       status: "success",
//       results: products.length,
//       products,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // GET @ /api/v1/cart/:id
// // @desc fetch a particular cart

// exports.getAProduct = async (req, res, next) => {
//   try {
//     const data = await Cart.findOne({ _id: req.params.id });

//     if (!data)
//       return next(new CreateError(`Cart with this id doesn't exist`, 404));

//     res.status(200).json({
//       status: "success",
//       data,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
