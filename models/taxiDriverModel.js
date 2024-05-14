// userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const Schema = mongoose.Schema;

const driverSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        validate: [validator.isEmail, 'Invalid email']
    },
    password: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        unique: true,
        required: true
    },
    accessCode: {
        type: String,
        unique: true,
        required: true
    }
});

driverSchema.statics.signup = async function(email, password, companyName, accessCode) {
  if (!email || !password || !companyName || !accessCode) {
    throw new Error('All fields must be filled');
  }
  
    const companyAccessCodes = {
    'Yego Cabs': 'YEGO2024',
    'Move Cabs': 'CABS2024',
  };

  if (companyAccessCodes[companyName] !== accessCode) {
    throw new Error('Invalid access code for the specified company');
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const taxiDriver = await this.create({ email, password: hash, companyName, accessCode });
  return taxiDriver;
};

driverSchema.statics.login = async function(companyName, password) {
  if (!companyName || !password) {
    throw new Error('All fields must be filled');
  }

  const taxiDriver = await this.findOne({ companyName });
  if (!taxiDriver) {
    throw new Error('Incorrect company name');
  }

  const match = await bcrypt.compare(password, taxiDriver.password);
  if (!match) {
    throw new Error('Incorrect password');
  }

  return taxiDriver;
};

module.exports = mongoose.model('Driver', driverSchema);
