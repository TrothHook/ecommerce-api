const jwt = require("jsonwebtoken");

const CreateError = require("../utils/createError");
const User = require("../models/userModel");

function signAccessToken({ ...info }) {
  return jwt.sign(info, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY
  });
}

const createSendToken = async (user, statusCode, res) => {
  const accessToken = signAccessToken({
    id: user._id,
    isAdmin: user.isAdmin
  });

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", accessToken, cookieOptions);

  console.log(user);

  const covertUser = await User.findById(user._id)
    .select("+refreshToken")
    .select("-createdAt")
    .select("-updatedAt")
    .select("-__v");

  if (!covertUser)
    return res.status(404).json({
      status: "fail",
      msg: "No token found"
    });

  res.status(statusCode).json({
    status: "success",
    accessToken,
    data: covertUser
  });
};

exports.generateAccessTokenFromRefreshToken = async (req, res, next) => {
  try {
    const refreshTokenDB = req.body.token;
    const user = await User.findOne({ refreshToken: refreshTokenDB }).select(
      "+refreshToken"
    );

    if (!user) return next(new CreateError("Login to continue", 404));

    console.log(user);
    console.log(user.refreshToken);
    console.log(refreshTokenDB);

    if (!refreshTokenDB)
      return next(new CreateError("Please register or Login", 401));

    if (!(user.refreshToken === refreshTokenDB))
      return next(new CreateError("Token do not match", 403));

    jwt.verify(
      refreshTokenDB,
      process.env.JWT_REFRESH_SECRET,
      async (err, user2) => {
        if (err) return next(new CreateError("use correct token", 403));

        // console.log(user2)
        const user3 = await User.findById(user2.id);

        createSendToken(user3, 201, res);
      }
    );
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

exports.signUp = async (req, res, next) => {
  try {
    const newUser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      isAdmin: req.body.isAdmin
    });

    createSendToken(newUser, 201, res);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

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

    user.signRefreshToken();
    user.save();

    createSendToken(user, 201, res);
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    jwt.verify(req.body.token, process.env.JWT_REFRESH_SECRET, (err, user) => {
      if (err) return next(new CreateError("refresh token is not valid", 401));
      req.user = user;
    });
    await User.updateOne({ _id: req.user.id }, { $unset: { refreshToken: 1 } });

    res.status(201).json({
      status: "success",
      msg: "user is logged out"
    });
  } catch (error) {
    next(error);
  }
};
