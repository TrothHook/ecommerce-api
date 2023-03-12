const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  name: {
    type: String
  },
  age: {
    type: Number
  }
});

const test = mongoose.model("Test", testSchema);

module.exports = test;
