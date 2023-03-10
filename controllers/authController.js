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
      msg: "new user added",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      msg: error.message,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!password || !username) {
      return next(new CreateError("Provide username and password", 400));
    }

    const user = await User.findOne({ username }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      console.log(user);
      return next(new CreateError("Incorrect Email or password", 401));
    }

    res.status(200).json({
      status: "success",
      msg: 'logged in!',
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      msg: error.message,
    });
  }
};
