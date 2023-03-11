"use strict";
const jwt = require("jsonwebtoken");

const CreateError = require("../utils/createError");
const User = require("../models/userModel");

function signAccessToken({ ...info }) {
  return jwt.sign(info, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY,
  });
}

exports.generateAccessTokenFromRefreshToken = async (req, res, next) => {
  try {
    const refreshTokenDB = req.body.token;
    const user = await User.find({ refreshToken: refreshTokenDB });

    if (!refreshTokenDB) return next(new CreateError("Not Allowed", 401));

    if (!user.refreshToken === refreshTokenDB)
      return next(new CreateError("Token do not match", 403));

    jwt.verify(refreshTokenDB, process.env.JWT_REFRESH_SECRET, (err, user) => {
      if (err) return next(new CreateError("use correct token", 403));

      // console.log(user)
      const accessToken = signAccessToken({
        id: user._id,
        isAdmin: user.isAdmin,
      });
      res.status(200).json({
        status: "success",
        accessToken,
      });
    });
  } catch (error) {
    next(error);
  }
};

// authenticate middleware
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  //   console.log(req.headers)
  if (!authHeader) return next(new CreateError("You are not logged in", 401));

  const token = authHeader.split(" ")[1];

  if (!token) return next(new CreateError("No token found!", 401));

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, result) => {
    if (err) return next(new CreateError("Token is invalid", 403));
    // console.log(result);
    req.user = result;
    next();
  });
};

// exports.authenticateAndAuthorizeToken = (req, res, next) => {
//   this.authenticateToken(req, res, () => {
//     if (req.user.id === req.params.id || req.user.isAdmin) {
//       next();
//     } else {
//       return next(new CreateError("You are not allowed to do that!", 403));
//     }
//   });
// };

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

    user.signRefreshToken();
    user.save();

    const refresh = user.refreshToken;

    res.status(200).json({
      status: "success",
      accessToken,
      refresh,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      msg: error.message,
    });
  }
};
