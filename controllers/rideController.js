const Bus = require('../models/busModel');
const Ride = require('../models/rideModel');
const mongoose = require('mongoose');
const BusDetails = require('../models/busDetailsModel')

const getRides = async (req, res) => {
  const user_id = req.user._id;
  try {
    const rides = await Ride.find({ user_id }).populate('bus').sort({ createdAt: -1 });
    res.status(200).json(rides);
  } catch (error) {
    console.error('Error fetching rides:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getRideById = async (req, res) => {
  const rideId = req.params.rideId;
  try {
    const ride = await Ride.findById(rideId).populate('bus');
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    res.status(200).json(ride);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find().populate('bus').sort({ createdAt: -1 });
    res.status(200).json(rides);
  } catch (error) {
    console.error('Error fetching rides:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getRide = async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({error: 'No such ride'})
  }
  const ride = await Ride.findById(id).populate('bus')
  if (!ride) {
    return res.status(404).json({error: 'No such ride'})
  }
  res.status(200).json(ride)
}

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
    return null; // Return null if stations is not an array
  }

  let totalPrice = 0;

  // Calculate price for each segment of the journey
  for (let i = 0; i < stations.length - 1; i++) {
    const route = [stations[i], stations[i + 1]].join('-');
    if (routePrices.hasOwnProperty(route)) {
      totalPrice += routePrices[route];
    } else {
      return null; // Return null if any segment price is not found
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

const createRide = async (req, res) => {
  const { stations, time, bus_id, price, schedule } = req.body;
  let emptyFields = [];

  if (!stations || stations.length < 2) {
    emptyFields.push('stations');
  }
  if (!time) {
    emptyFields.push('time');
  }
  if (!bus_id) {
    emptyFields.push('bus_id');
  }
  if (!schedule || !schedule.type) {
    emptyFields.push('schedule.type');
  }
  if (emptyFields.length > 0) {
    return res.status(400).json({ error: 'Please fill in all the required fields', emptyFields });
  }

  try {
    const selectedBus = await Bus.findById(bus_id);
    if (!selectedBus) {
      return res.status(404).json({ error: 'Selected bus not found' });
    }

    const user_id = req.user._id;
    const rides = [];
    const rideGroupId = new mongoose.Types.ObjectId();

    const existingRidesFromAB = await Ride.find({ bus: selectedBus, stations: [stations[0], stations[1]] });
    const existingRidesFromBA = await Ride.find({ bus: selectedBus, stations: [stations[1], stations[0]] });

    if (existingRidesFromAB.length >= selectedBus.capacity) {
      return res.status(400).json({ error: 'Seats are full from station A to station B' });
    }

    if (existingRidesFromBA.length >= selectedBus.capacity) {
      return res.status(400).json({ error: 'Seats are full from station B to station A' });
    }

    if (schedule.type === 'interval') {
      let intervalMilliseconds;
      if (schedule.intervalUnit === 'minutes') {
        intervalMilliseconds = schedule.frequency * 60000;
      } else if (schedule.intervalUnit === 'hours') {
        intervalMilliseconds = schedule.frequency * 3600000;
      }

      const createRides = async () => {
        
        for (let i = 0; i < stations.length - 1; i++) {
          for (let j = i + 1; j < stations.length; j++) {
            const ridePrice = price || calculateRidePrice([stations[i], stations[j]]);

            const ride1 = await Ride.create({
              bus: selectedBus,
              stations: [stations[i], stations[j]],
              time,
              price: ridePrice ? ridePrice : null,
              user_id,
              rideGroupId,
              publishSchedule: []
            });
            rides.push(ride1);

            const ride2 = await Ride.create({
              bus: selectedBus,
              stations: [stations[j], stations[i]],
              time,
              price: ridePrice ? ridePrice : null,
              user_id,
              rideGroupId,
              publishSchedule: []
            });
            rides.push(ride2);
          }
        }

        const busDetails = await BusDetails.findOne({ rideGroupId });
        if (!busDetails) {
          await BusDetails.create({
            rideGroupId,
            busCapacity: selectedBus.capacity
          });
        }
      };

      await createRides();
      const intervalId = setInterval(createRides, intervalMilliseconds);
      res.status(200).json({ rides, intervalId });
    } else {
      
      for (let i = 0; i < stations.length - 1; i++) {
        for (let j = i + 1; j < stations.length; j++) {
          const ridePrice = price || calculateRidePrice([stations[i], stations[j]]);

          const ride1 = await Ride.create({
            bus: selectedBus,
            stations: [stations[i], stations[j]],
            time,
            price: ridePrice ? ridePrice : null,
            user_id,
            rideGroupId,
            publishSchedule: schedule.type === 'scheduled' ? schedule.times : []
          });
          rides.push(ride1);

          const ride2 = await Ride.create({
            bus: selectedBus,
            stations: [stations[j], stations[i]],
            time,
            price: ridePrice ? ridePrice : null,
            user_id,
            rideGroupId,
            publishSchedule: schedule.type === 'scheduled' ? schedule.times : []
          });
          rides.push(ride2);
        }
      }

      const busDetails = await BusDetails.findOne({ rideGroupId });
      if (!busDetails) {
        await BusDetails.create({
          rideGroupId,
          busCapacity: selectedBus.capacity
        });
      }

      res.status(200).json(rides);
    }
  } catch (error) {
    console.error('Error creating ride:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports = { createRide };

module.exports = {
  createRide,
  calculateRidePrice,
  getRides,
  getRideById,
  getAllRides,
  getRide,
};