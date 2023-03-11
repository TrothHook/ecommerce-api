const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(authController.authenticateToken, userController.getUsers);
router
  .route("/:id")
  .patch(authController.authenticateToken, userController.userAccount);

module.exports = router;
