const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(authController.authenticateToken, userController.getUsers);

router
  .route("/stats")
  .get(authController.authenticateToken, userController.getUserStats);

router
  .route("/:id")
  .get(authController.authenticateToken, userController.getUser)
  .patch(authController.authenticateToken, userController.userAccount)
  .delete(authController.authenticateToken, userController.deleteUser);

module.exports = router;
