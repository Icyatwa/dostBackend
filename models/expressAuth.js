const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')

const Schema = mongoose.Schema

const ExpressAuthSchema = new Schema({
    expressName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
  
    expressCode: {
        type: String,
        required: true
    },
})

// static signup method
ExpressAuthSchema.statics.signup = async function(email, password) {

  
    if (!validator.isEmail(email)) {
        throw Error('Email not valid')
    }

    const exists = await this.findOne({ email })

    if (exists) {
        throw Error('Email already in use')
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const express = await this.create({ expressName, email, password: hash, expressCode })

    return express
}

// static login method
ExpressAuthSchema.statics.login = async function(expressName, email, password, expressCode) {

  if ( !expressName || !email || !password || !expressCode ) {
    throw Error('All fields must be filled')
  }

  const user = await this.findOne({ email })
  if (!user) {
    throw Error('Incorrect email')
  }

  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    throw Error('Incorrect password')
  }

  return user
}

module.exports = mongoose.model('ExpressAuth', ExpressAuthSchema)