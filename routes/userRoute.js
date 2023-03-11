const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

router.route("/getuser").get(authController.authenticateToken, userController.getUsers);


module.exports = router;