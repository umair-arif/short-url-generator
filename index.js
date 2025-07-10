require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const app = express();
const urlRoute = require("./routes/url");
const staticRouter = require("./routes/staticRouter");
const userRoute = require("./routes/user");
const URL = require("./models/url");
const { restrictToLoggedInUserOnly, checkAuth } = require("./middlewares/auth");
const { connectToMongoDb } = require("./connect");

connectToMongoDb(process.env.MONGO_URL).then(() =>
  console.log("✅ MongoDB connected..")
);

const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use("/url", restrictToLoggedInUserOnly, urlRoute);
app.use("/user", userRoute);
app.use("/", checkAuth, staticRouter);

app.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId.trim();
  console.log("Request received for shortId:", shortId);

  try {
    const entry = await URL.findOneAndUpdate(
      { shortId },
      { $push: { visitHistory: { timeStamp: Date.now() } } },
      { new: true }
    );

    if (!entry) {
      console.log("❌ No entry found for shortId:", shortId);
      return res.status(404).json({ error: "Short URL not found" });
    }

    console.log("✅ Found entry:", entry);
    res.redirect(entry.redirectUrl);
  } catch (err) {
    console.error("⚠️ Error occurred:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => console.log("server started"));
