const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "email id is required"],
      unique: true,
      validate: [validator.isEmail, "Email is invalid"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minlength: 8,
      select: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// hashing password with bcryptjs

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

// comparing hashed password with the password entered in req.body

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.signRefreshToken = function () {
  this.refreshToken = jwt.sign(
    {
      id: this._id,
      isAdmin: this.isAdmin,
    },
    process.env.JWT_REFRESH_SECRET
  );
};

module.exports = mongoose.model("User", userSchema);
