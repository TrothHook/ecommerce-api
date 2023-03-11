const bcrypt = require("bcryptjs");

const User = require("../models/userModel");
const CreateError = require("../utils/createError");

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

    const data = await User.find({});

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
