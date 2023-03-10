const express = require("express");
// const testRoute = require('./routes/testRoute')
const authRoute = require('./routes/authRoute');
const userRoute = require('./routes/userRoute');

const app = express();

// parse json data
app.use(express.json());

// parse form data
app.use(express.urlencoded({ extended: true }));


// ROUTES

// app.use("/api/v1", testRoute);

app.use('/api/v1/auth', authRoute);
app.use('/api/v1/', userRoute)

module.exports = app;
