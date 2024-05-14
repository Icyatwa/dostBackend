// taxiDriverController.js
const TaxiDriver = require('../models/taxiDriverModel');
const jwt = require('jsonwebtoken');

const createToken = (_id) => {
  return jwt.sign({_id}, process.env.TAXISECRET, { expiresIn: '3d' });
};

const loginDriver = async (req, res) => {
  const { companyName, password } = req.body;
  try {
    const taxiDriver = await TaxiDriver.login(companyName, password);
    const token = createToken(taxiDriver._id);
    res.status(200).json({ companyName, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const signupDriver = async (req, res) => {
  const { email, password, companyName, accessCode } = req.body;
  try {
    const taxiDriver = await TaxiDriver.signup(email, password, companyName, accessCode);
    const token = createToken(taxiDriver._id);
    res.status(200).json({ email, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { signupDriver, loginDriver };
