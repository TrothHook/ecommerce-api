const bcrypt = require("bcryptjs");

const User = require("../models/userModel");
const CreateError = require("../utils/createError");

// GET @ /api/v1/user
// @desc only admin

exports.getUsers = async (req, res, next) => {
  try {
    // console.log(req.user);
    if (!req.user.isAdmin)
      return next(
        new CreateError(
          "You have to be logged in as an Admin to access this route",
          403
        )
      );

    // Filter the newest document
    const queryString = req.query.new;

    const data = queryString
      ? await User.find({}).limit(1).sort({ _id: -1 })
      : await User.find({});

    res.status(200).json({
      status: "success",
      results: data.length,
      data,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      msg: error,
    });
  }
};

// GET @ /api/v1/user/:id
// @desc only admin

exports.getUser = async (req, res, next) => {
  try {
    // console.log(req.user);
    if (!req.user.isAdmin)
      return next(
        new CreateError(
          "You have to be logged in as an Admin to access this route",
          403
        )
      );

    const data = await User.findOne({ _id: req.params.id });

    if (!data)
      return next(new CreateError(`User with this id doesn't exist`, 404));

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      msg: error,
    });
  }
};

// PATCH @ api/v1/user/:id
// @desc only admin and logged in user

exports.userAccount = async (req, res, next) => {
  try {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      if (req.body.password)
        req.body.password = await bcrypt.hash(req.body.password, 12);

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json({
        status: "success",
        updatedUser,
      });
    } else {
      return next(new CreateError("You are not allowed to do that!", 403));
    }
  } catch (error) {
    next(error);
  }
};

// DELETE @ api/v1/user/:id
// @desc only admin

exports.deleteUser = async (req, res, next) => {
  try {
    if (req.user.isAdmin) {
      const deletedUser = await User.deleteOne({ _id: req.params.id });

      console.log(deletedUser.deletedCount);

      if (deletedUser.deletedCount === 0)
        return next(new CreateError("User with this id doesn't exist", 404));

      res.status(200).json({
        status: "success",
        msg: "user deleted",
      });
    }
  } catch (error) {}
};

// GET @ api/v1/user/stats
// @desc get number of users registered in each month for past one year

exports.getUserStats = async (req, res, next) => {
  const currentDate = new Date();
  const lastYear = new Date(
    currentDate.setFullYear(currentDate.getFullYear() - 1)
  );
  try {
    if (!req.user.isAdmin)
      return next(
        new CreateError(
          "you have to login as an admin to access this route",
          403
        )
      );

    const data = await User.aggregate([
      {
        $match: { createdAt: { $gte: lastYear } },
      },
      {
        $project: { month: { $month: "$createdAt" } },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};
