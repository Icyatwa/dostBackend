// userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
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

userSchema.statics.signup = async function(email, password, companyName, accessCode) {
  if (!email || !password || !companyName || !accessCode) {
    throw new Error('All fields must be filled');
  }
  
    const companyAccessCodes = {
    'East African Bus & Travel Ltd': 'EABT2024',
    'Ruhire Express': 'RHXP2024',
    'Kigali Coach Tour & Travel': 'KCTT2024',
    'Matunda Express': 'MTDX2024',
    'International Express': 'INEX2024',
    'Virunga Express': 'VRGX2024',
    'Volcano Express': 'VLCX2024',
    'Horizon Express': 'HRZX2024',
    'Stella Express': 'STEX2024',
    'Kivu Belt': 'KVBT2024',
    'Ritco Express': 'RTCX2024',
    'Different Express': 'DIFX2024',
    'Star Express': 'STAX2024',
    'Select Express': 'SLTX2024',
    'Fidelity Express': 'FDTY2024',
    'Yahoo Car Express': 'YCEX2024',
    'Alpha Express': 'ALPX2024',
    'Two Express': 'Two2024',
  };

  if (companyAccessCodes[companyName] !== accessCode) {
    throw new Error('Invalid access code for the specified company');
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const user = await this.create({ email, password: hash, companyName, accessCode });
  return user;
};

userSchema.statics.login = async function(companyName, password) {
  if (!companyName || !password) {
    throw new Error('All fields must be filled');
  }

  const user = await this.findOne({ companyName });
  if (!user) {
    throw new Error('Incorrect company name');
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new Error('Incorrect password');
  }

  return user;
};

module.exports = mongoose.model('User', userSchema);
