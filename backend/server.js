const express = require("express");
const mongoose = require("mongoose");
const TShirt = require("./models/TShirt");

const app = express();

app.use(express.json());

mongoose.connect("mongodb://admin:123456@localhost:27017")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("Backend is running");
});

//Thêm áo vào trong db
app.post("/tshirt", async (req, res) => {
  try {
    const tshirt = await TShirt.create(req.body);
    res.json(tshirt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//lấy danh sách áo
app.get("/tshirt", async (req, res) => {
  try {
    const tshirts = await TShirt.find();
    res.json(tshirts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//API PUT cho chức năng update
app.put("/tshirt/:id", async (req, res) => {
  try {
    const updated = await TShirt.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//API xoá
app.delete("/tshirt/:id", async (req, res) => {
  try {
    const deleted = await TShirt.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "TShirt not found" });
    }

    res.json({ message: "TShirt deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
