

// taxiRequireAuth.js
const jwt = require('jsonwebtoken')
const TaxiDriver = require('../models/taxiDriverModel')

const requireAuth = async (req, res, next) => {
  // verify user is authenticated
  const { authorization } = req.headers
 
  if (!authorization) {
    return res.status(401).json({error: 'Authorization token required'})
  }

  const token = authorization.split(' ')[1]

  try {
    const { _id } = jwt.verify(token, process.env.TAXISECRET)

    req.taxiDriver = await TaxiDriver.findOne({ _id }).select('_id')
    next()

  } catch (error) {
    console.log(error)
    res.status(401).json({error: 'Request is not authorized'})
  }
}

module.exports = requireAuth

// taxiDriverModel.js
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
    'Yes Cabs': 'YEGO2024',
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


// taxiModel.js
const mongoose = require('mongoose');

const taxiSchema = new mongoose.Schema({
  cab: { type: mongoose.Schema.Types.ObjectId, ref: 'Cab', required: true},
  stations: { type: [String], required: true },
  time: { type: String },
  price: { type: Number },
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  publishSchedule: { type: [Object] },
  taxiGroupId: { type: mongoose.Schema.Types.ObjectId, required: true },
  bookedSeats: { type: Map, of: Number, default: {} }
}, { timestamps: true });

const Taxi = mongoose.model('Taxi', taxiSchema);

module.exports = Taxi;


// taxiController.js
const Cab = require('../models/cabModel');
const Taxi = require('../models/taxiModel');
const mongoose = require('mongoose');
const CabDetails = require('../models/cabDetailsModel')

const routePrices = {
  "Nyabugogo-Huye": 3700,
  "Misove-Base": 2500,
  "Kigali-Misove": 4500,
  "Kigali-Base": 3500,
  "Kigali-Huye": 1500,
  "Kigali-Gisagara": 2500,
  "Huye-Gisagara": 500,
  "Nyabugogo-Gicumbi-Gatuna": 1082,
  "Rukomo-Gicumbi-Gatuna": 1038,
  "Gicumbi-Base": 1462,
  "Gicumbi-Rutare": 1462,
  "Gicumbi-Gakenke": 2003,
  "Gicumbi-Kivuye": 2016,
};

const calculateRidePrice = (stations) => {
  if (!Array.isArray(stations)) {
    return null;
  }

  let totalPrice = 0;

  for (let i = 0; i < stations.length - 1; i++) {
    const route = [stations[i], stations[i + 1]].join('-');
    if (routePrices.hasOwnProperty(route)) {
      totalPrice += routePrices[route];
    } else {
      return null;
    }
  }

  return totalPrice;
};

const stations = ['Kigali', 'Huye'];
const price = calculateRidePrice(stations);

if (price !== null) {
  console.log('Price:', price);
} else {
  console.log('Price not found for the provided route');
}

const createTaxi = async (req, res) => {
  const { stations, time, cab_id, price, schedule } = req.body;
  let emptyFields = [];

  if (!stations || stations.length < 2) {
    emptyFields.push('stations');
  }
  if (!time) {
    emptyFields.push('time');
  }
  if (!cab_id) {
    emptyFields.push('cab_id');
  }
  if (!schedule || !schedule.type) {
    emptyFields.push('schedule.type');
  }
  if (emptyFields.length > 0) {
    return res.status(400).json({ error: 'Please fill in all the required fields', emptyFields });
  }

  try {
    const selectedCab = await Cab.findById(cab_id);
    if (!selectedCab) {
      return res.status(404).json({ error: 'Selected cab not found' });
    }

    const taxiDriver_id = req.taxiDriver._id;
    const taxis = [];
    const taxiGroupId = new mongoose.Types.ObjectId();

    const existingTaxisFromAB = await Taxi.find({ cab: selectedCab, stations: [stations[0], stations[1]] });
    const existingTaxisFromBA = await Taxi.find({ cab: selectedCab, stations: [stations[1], stations[0]] });

    if (existingTaxisFromAB.length >= selectedCab.capacity) {
      return res.status(400).json({ error: 'Seats are full from station A to station B' });
    }

    if (existingTaxisFromBA.length >= selectedCab.capacity) {
      return res.status(400).json({ error: 'Seats are full from station B to station A' });
    }

    if (schedule.type === 'interval') {
      let intervalMilliseconds;
      if (schedule.intervalUnit === 'minutes') {
        intervalMilliseconds = schedule.frequency * 60000;
      } else if (schedule.intervalUnit === 'hours') {
        intervalMilliseconds = schedule.frequency * 3600000;
      }

      const createTaxis = async () => {
        
        for (let i = 0; i < stations.length - 1; i++) {
          for (let j = i + 1; j < stations.length; j++) {
            const taxiPrice = price || calculateRidePrice([stations[i], stations[j]]);

            const taxi1 = await Taxi.create({
                cab: selectedCab,
                stations: [stations[i], stations[j]],
                time,
                price: taxiPrice ? taxiPrice : null,
                taxiDriver_id,
                taxiGroupId,
                publishSchedule: []
            });
            taxis.push(taxi1);

            const taxi2 = await Taxi.create({
                cab: selectedCab,
                stations: [stations[j], stations[i]],
                time,
                price: taxiPrice ? taxiPrice : null,
                taxiDriver_id,
                taxiGroupId,
                publishSchedule: []
            });
            taxis.push(taxi2);
        }}

        const cabDetails = await CabDetails.findOne({ taxiGroupId });
        if (!cabDetails) {
          await CabDetails.create({
            taxiGroupId,
            cabCapacity: selectedCab.capacity
          });
        }
      };

      await createTaxis();
      const intervalId = setInterval(createTaxis, intervalMilliseconds);
      res.status(200).json({ taxis, intervalId });
    } else {
      
      for (let i = 0; i < stations.length - 1; i++) {
        for (let j = i + 1; j < stations.length; j++) {
          const taxiPrice = price || calculateRidePrice([stations[i], stations[j]]);

          const taxi1 = await Taxi.create({
            cab: selectedCab,
            stations: [stations[i], stations[j]],
            time,
            price: taxiPrice ? taxiPrice : null,
            taxiDriver_id,
            taxiGroupId,
            publishSchedule: schedule.type === 'scheduled' ? schedule.times : []
          });
          taxis.push(taxi1);

          const taxi2 = await Taxi.create({
            cab: selectedCab,
            stations: [stations[j], stations[i]],
            time,
            price: taxiPrice ? taxiPrice : null,
            taxiDriver_id,
            taxiGroupId,
            publishSchedule: schedule.type === 'scheduled' ? schedule.times : []
          });
          taxis.push(taxi2);
        }
      }

      const cabDetails = await CabDetails.findOne({ taxiGroupId });
      if (!cabDetails) {
        await CabDetails.create({
          taxiGroupId,
          cabCapacity: selectedCab.capacity
        });
      }

      res.status(200).json(taxis);
    }
  } catch (error) {
    console.error('Error creating taxi:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports = { createTaxi };

module.exports = {
    createTaxi,
    calculateRidePrice,
};

// server.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const http = require('http');
const socketIo = require('socket.io');
const carpoolRoutes = require('./routes/carpoolRoutes');
const userRoutes = require('./routes/user');
const busRoutes = require('./routes/bus');
const rideRoutes = require('./routes/ride');
const bookingRoutes = require('./routes/rideBookingRoutes');
const carpoolBookingRoutes = require('./routes/bookingRoutes')
const busDetailsRoutes = require('./routes/busDetails');
const cabRoutes = require('./routes/cab')
const cabDetailsRoutes = require('./routes/cabDetails');
const taxiRoutes = require('./routes/taxi');
const taxiBookingRoutes = require('./routes/taxiBookingRoutes');
const taxiDriverRoutes = require('./routes/taxiDriver');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/carpools', carpoolRoutes);
app.use('/api/user', userRoutes);
app.use('/api/bus', busRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/details', busDetailsRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/carpoolBookings', bookingRoutes);
app.use('/api/cabDetails', cabDetailsRoutes);
app.use('/api/taxis', taxiRoutes);
app.use('/api/taxiBookings', taxiBookingRoutes);
app.use('/api/taxiDrivers', taxiDriverRoutes);
app.use('/api/cabs', cabRoutes);

const server = http.createServer(app);
const io = socketIo(server);

module.exports.io = io;
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
})
  .catch((error) => {
    console.log(error);
});

