const express = require("express");
// const testRoute = require('./routes/testRoute')
const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");
const globalErrorHandler = require("./controllers/errorController");
const CreateError = require("./utils/createError");

const app = express();

// parse json data
app.use(express.json());

// parse form data
app.use(express.urlencoded({ extended: true }));

// ROUTES

// app.use("/api/v1", testRoute);

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/", userRoute);

// Handling error for routes that don't exist
app.all("*", (req, res, next) => {
  next(new CreateError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
