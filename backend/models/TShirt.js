const mongoose = require("mongoose");

const TShirtSchema = new mongoose.Schema({
  name: String,
  price: Number,
  color: String,
  size: String,
}, { timestamps: true });

module.exports = mongoose.model("TShirt", TShirtSchema);