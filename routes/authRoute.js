const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.route("/signup").post(authController.signUp);
router.route("/login").post(authController.login);
router.route("/token").post(authController.generateAccessTokenFromRefreshToken);

router.route("/logout").delete(authController.logout);

module.exports = router;
