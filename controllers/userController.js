const User = require("../models/userModel");

exports.getUsers = async (req, res) => {
  try {
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
