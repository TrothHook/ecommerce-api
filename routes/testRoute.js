const express = require("express");

const testController = require("../controllers/testController");

const router = express.Router();

router
  .route("/test")
  .get(testController.getTestData)
  .post(testController.createDummy);

router.route("/test/:id").delete(testController.deleteData);

module.exports = router;
