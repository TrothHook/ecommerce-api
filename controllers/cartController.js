const Cart = require("../models/cartModel");
const CreateError = require("../utils/createError");

// POST @ /api/v1/cart
// @desc only registered user can add new cart in database

exports.addProductsToCart = async (req, res, next) => {
  try {
    const newCart = await Cart.create(req.body);
    res.status(201).json({
      status: "success",
      data: newCart
    });
  } catch (error) {
    next(error);
  }
};

// PATCH @ api/v1/cart/:id
// @desc only admin can update a cart

exports.updateCart = async (req, res, next) => {
  try {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      if (!(await Cart.findOne({ _id: req.params.id })))
        return next(new CreateError("No cart found with this ID", 404));

      const updatedCart = await Cart.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body
        },
        { new: true }
      );
      res.status(200).json({
        status: "success",
        updatedCart
      });
    } else {
      return next(new CreateError("You are not allowed to do that!", 403));
    }
  } catch (error) {
    next(error);
  }
};

// DELETE @ api/v1/cart/:id
// @desc only admin as well as registered user can delete a cart

exports.deleteCart = async (req, res, next) => {
  try {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      const deletedCart = await Cart.deleteOne({ _id: req.params.id });

      //   console.log(deletedCart.deletedCount);

      if (deletedCart.deletedCount === 0)
        return next(new CreateError("Cart with this id doesn't exist", 404));

      res.status(200).json({
        status: "success",
        msg: "cart deleted"
      });
    }
  } catch (error) {
    next(error);
  }
};

// GET @ /api/v1/cart/:userId
// @desc fetch a particular cart

exports.getACart = async (req, res, next) => {
  try {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      const data = await Cart.findOne({ _id: req.params.userId });

      if (!data)
        return next(new CreateError(`Cart with this id doesn't exist`, 404));

      res.status(200).json({
        status: "success",
        data
      });
    } else {
      return next(new CreateError("You are not allowed to do that!", 403));
    }
  } catch (error) {
    next(error);
  }
};

// GET @ /api/v1/cart/
// @desc fetch all the carts of all users

exports.getAllCarts = async (req, res, next) => {
  try {
    if (req.user.isAdmin) {
      const carts = await Cart.find({});

      res.status(200).json({
        status: "success",
        results: carts.length,
        carts
      });
    } else {
      return next(
        new CreateError(
          "you have to be admin inorder to access all the carts",
          403
        )
      );
    }
  } catch (error) {
    next(error);
  }
};
