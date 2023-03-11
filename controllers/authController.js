"use strict";
const jwt = require("jsonwebtoken");

const CreateError = require("../utils/createError");
const User = require("../models/userModel");

function signAccessToken({ ...info }) {
  return jwt.sign(info, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY,
  });
}

const createSendToken = (user, statusCode, res) => {
  const accessToken = signAccessToken({
    id: user._id,
    isAdmin: user.isAdmin,
  });

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", accessToken, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    accessToken,
    data: user,
  });
};

exports.generateAccessTokenFromRefreshToken = async (req, res, next) => {
  try {
    const refreshTokenDB = req.body.token;
    const user = await User.find({ refreshToken: refreshTokenDB });

    if (!refreshTokenDB)
      return next(new CreateError("Please register or Login", 401));

    if (!user.refreshToken === refreshTokenDB)
      return next(new CreateError("Token do not match", 403));

    jwt.verify(refreshTokenDB, process.env.JWT_REFRESH_SECRET, (err, user) => {
      if (err) return next(new CreateError("use correct token", 403));

      // console.log(user)
      // const accessToken = signAccessToken({
      //   id: user._id,
      //   isAdmin: user.isAdmin,
      // });
      // res.status(200).json({
      //   status: "success",
      //   accessToken,
      // });
      createSendToken(user, 201, res);
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

    // const accessToken = signAccessToken({
    //   id: newUser._id,
    //   isAdmin: newUser.isAdmin,
    // });

    // res.status(201).json({
    //   status: "success",
    //   msg: "new user added",
    //   token: accessToken,
    // });
    createSendToken(newUser, 201, res);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    var { username, password } = req.body;

    if (!password || !username) {
      return next(new CreateError("Provide username and password", 400));
    }

    const user = await User.findOne({ username })
      .select("+password")
      .select("-createdAt")
      .select("-updatedAt")
      .select("-__v");

    if (!user || !(await user.correctPassword(password, user.password))) {
      //   console.log(user);
      return next(new CreateError("Incorrect Email or password", 401));
    }

    // var { password, ...others } = user._doc;

    // const accessToken = signAccessToken({
    //   id: user._id,
    //   isAdmin: user.isAdmin,
    // });

    user.signRefreshToken();
    user.save();

    createSendToken(user, 201, res);
    // const refresh = user.refreshToken;

    // res.status(200).json({
    //   status: "success",
    //   accessToken,
    //   refresh,
    // });
  } catch (error) {
    next(error);
  }
};
