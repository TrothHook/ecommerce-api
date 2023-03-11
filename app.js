const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

// const testRoute = require('./routes/testRoute')
const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const globalErrorHandler = require("./controllers/errorController");
const CreateError = require("./utils/createError");

const app = express();

app.use(cookieParser());

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// parse json data
app.use(express.json());

// parse form data
app.use(express.urlencoded({ extended: true }));

// ROUTES

// app.use("/api/v1", testRoute);

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);

// Handling error for routes that don't exist
app.all("*", (req, res, next) => {
  next(new CreateError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// global error handler
app.use(globalErrorHandler);

module.exports = app;
