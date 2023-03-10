const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config/config.env" });

const DB = process.env.DB_ATLAS.replace(
  "<password>",
  process.env.DB_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => {
    console.log("connected to the DB");
  })
  .catch((err) => {
    console.log(err);
  });
