const { nanoid } = require("nanoid");

const URL = require("../models/url");

async function handleGenerateNewShortUrl(req, res) {
  const body = req.body;
  console.log(body);
  if (!body.url) return res.status(400).json({ error: "Url is required." });

  const shortId = nanoid(8);
  await URL.create({
    shortId: shortId,
    redirectUrl: body.url,
    visitHistory: [],
    createdBy: req.user._id,
  });
  const allUrls = await URL.find({ createdBy: req.user._id });
  return res.render("home", { id: shortId, urls: allUrls });
}

async function handleGetAnalytics(req, res) {
  const shortId = req.params.shortId;
  const result = await URL.findOne({ shortId });
  return res.json({
    totalClicks: result.visitHistory.length,
    analytics: result.visitHistory,
  });
}
module.exports = {
  handleGenerateNewShortUrl,
  handleGetAnalytics,
};
