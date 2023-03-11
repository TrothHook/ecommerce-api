const User = require("../models/userModel");
const CreateError = require("../utils/createError");

exports.getUsers = async (req, res, next) => {
  try {
    // console.log(req.user);
    if (!req.user.isAdmin)
      return next(new CreateError("You have to be logged in as an Admin", 401));

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
