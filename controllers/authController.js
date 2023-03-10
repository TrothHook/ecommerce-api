const User = require("../models/userModel");

exports.signUp = async (req, res) => {
  try {
    const newUser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      isAdmin: req.body.isAdmin,
    });
    res.status(201).json({
      status: "success",
      msg: "new user added"
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      msg: error.message,
    });
  }
};


exports.login = async (req, res) => {
    const user = await User.find({
        username: req.body.username
    })
}