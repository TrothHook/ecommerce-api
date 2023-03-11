const CreateError = require("../utils/createError");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateErrorDB(error);
    if (error.name === "ValidationError") error = handleValidationError(error);

    sendErrorProduction(error, req, res);
  }
};

// Handling cast error

function handleCastErrorDB(error) {
  const message = `Invalid ${error.path}: ${error.value}.`;
  return new CreateError(message, 400);
}

// Handling duplicate fields error

function handleDuplicateErrorDB(error) {
  const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new CreateError(message, 400);
}

// Handling validation errors

function handleValidationError(error) {
  const errors = Object.values(error.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new CreateError(message, 400);
}

// when NODE_ENV = development

function sendErrorDev(error, req, res) {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: error.stack,
    });
  }

  console.log("ERROR!", error);
  return res.status(error.status).render("error", {
    title: "Something went wrong!",
    msg: error.message,
  });
}

// when NODE_ENV = production

function sendErrorProduction(err, req, res) {
  // A) API
  if (req.originalUrl.startsWith("/api")) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error("ERROR 💥", err);
    // 2) Send generic message
    return res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }

  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: err.message,
    });
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error("ERROR 💥", err);
  // 2) Send generic message
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong!",
    msg: "Please try again later.",
  });
}
