const { render } = require("ejs");
const { v4: uuidv4 } = require("uuid");
const { setUser } = require("../services/auth");
const USER = require("../models/user");

async function handleUserSignUp(req, res) {
  const { email, name, password } = req.body;
  await USER.create({ name, email, password });
  return res.render("/");
}

async function handleUserLogin(req, res) {
  const { email, password } = req.body;
  const user = await USER.findOne({ email, password });
  if (!user)
    return res.render("login", { error: "Invalid user email or password!" });
  const token = setUser(user);
  res.cookie("uid", token);
  return res.redirect("/");
}
module.exports = {
  handleUserSignUp,
  handleUserLogin,
};
