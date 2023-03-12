const Order = require("../models/orderModel");
const CreateError = require("../utils/createError");

// POST @ /api/v1/cart
// @desc only registered user can add new cart in database

exports.addOrder = async (req, res, next) => {
  try {
    const newOrder = await Order.create(req.body);
    res.status(201).json({
      status: "success",
      data: newOrder
    });
  } catch (error) {
    next(error);
  }
};

// PATCH @ api/v1/cart/:id
// @desc only admin can update a cart

exports.updateOrder = async (req, res, next) => {
  try {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      if (!(await Order.findOne({ _id: req.params.id })))
        return next(new CreateError("No order found with this ID", 404));

      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body
        },
        { new: true }
      );
      res.status(200).json({
        status: "success",
        updatedOrder
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

exports.deleteOrder = async (req, res, next) => {
  try {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      const deletedOrder = await Order.deleteOne({ _id: req.params.id });

      //   console.log(deletedOrder.deletedCount);

      if (deletedOrder.deletedCount === 0)
        return next(new CreateError("Order with this id doesn't exist", 404));

      res.status(200).json({
        status: "success",
        msg: "order deleted"
      });
    }
  } catch (error) {
    next(error);
  }
};

// GET @ /api/v1/cart/:userId
// @desc fetch a particular cart

exports.getAOrder = async (req, res, next) => {
  try {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      const data = await Order.find({ _id: req.params.userId });

      if (!data)
        return next(new CreateError(`Order with this id doesn't exist`, 404));

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
// @desc fetch all the orders of all users

exports.getAllOrders = async (req, res, next) => {
  try {
    if (req.user.isAdmin) {
      const orders = await Order.find({});

      res.status(200).json({
        status: "success",
        results: orders.length,
        orders
      });
    } else {
      return next(
        new CreateError(
          "you have to be admin inorder to access all the orders",
          403
        )
      );
    }
  } catch (error) {
    next(error);
  }
};

// GET @ /api/v1/order/monthlyIncome
// @desc get monthly income

exports.getMonthlyIncome = async (req, res, next) => {
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Order.aggregate([
      { $match: { createdAt: { $gte: previousMonth } } },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$amount"
        }
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" }
        }
      }
    ]);
    res.status(200).json({
      status: "success",
      data: income
    });
  } catch (error) {
    next(error);
  }
};
