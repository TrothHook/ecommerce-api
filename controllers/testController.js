const test = require("../models/testModel");

exports.getTestData = async (req, res) => {
  try {
    const data = await test.find({});
    res.status(200).json({
      status: "success",
      results: data.length,
      data,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      msg: error.message,
    });
  }
};

exports.createDummy = async (req, res) => {
  try {
    const someData = await test.create(req.body);
    res.status(201).json({
      status: "ok",
      someData,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      msg: error.message,
    });
  }
};

exports.deleteData = async (req, res) => {
  try {
    await test.deleteOne({ _id: req.params.id });
    res.json({
      status: "success",
      msg: "data has been deleted",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      msg: error.message,
    });
  }
};
