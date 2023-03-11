"use strict";
const jwt = require("jsonwebtoken");

const CreateError = require("../utils/createError");
const User = require("../models/userModel");

function signAccessToken({ ...info }) {
  return jwt.sign(info, process.env.JWT_ACCESS_SECRET, { expiresIn: "10m" });
}

// authenticate middleware
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  //   console.log(req.headers)
  const token = authHeader.split(" ")[1];
  if (!token) return next(new CreateError("Not Allowed", 401));

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, result) => {
    if (err) return next(new CreateError("Forbidden", 403));
    console.log(result);
    req.user = result;
    next();
  });
};

exports.signUp = async (req, res, next) => {
  try {
    const newUser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      isAdmin: req.body.isAdmin,
    });

    const accessToken = signAccessToken({
      id: newUser._id,
      isAdmin: newUser.isAdmin,
    });
    newUser.signRefreshToken();
    newUser.save();

    res.status(201).json({
      status: "success",
      msg: "new user added",
      token: accessToken,
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
    var { username, password } = req.body;

    if (!password || !username) {
      return next(new CreateError("Provide username and password", 400));
    }

    const user = await User.findOne({ username }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      //   console.log(user);
      return next(new CreateError("Incorrect Email or password", 401));
    }

    // var { password, ...others } = user._doc;

    const accessToken = signAccessToken({
      id: user._id,
      isAdmin: user.isAdmin,
    });

    const refreshToken = user.signRefreshToken();
    user.save();

    res.status(200).json({
      status: "success",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      msg: error.message,
    });
  }
};
