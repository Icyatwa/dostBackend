const Cab = require('../models/cabModel');
const Taxi = require('../models/taxiModel');
const mongoose = require('mongoose');
const CabDetails = require('../models/cabDetailsModel')

const getTaxis = async (req, res) => {
  const taxiDriver_id = req.taxiDriver._id;
  try {
    const taxis = await Taxi.find({ taxiDriver_id }).populate('cab').sort({ createdAt: -1 });
    res.status(200).json(taxis);
  } catch (error) {
    console.error('Error fetching taxis:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getTaxiById = async (req, res) => {
  const taxiId = req.params.taxiId;
  try {
    const taxi = await Taxi.findById(taxiId).populate('cab');
    if (!taxi) {
      return res.status(404).json({ message: 'Taxi not found' });
    }
    res.status(200).json(taxi);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getAllTaxis = async (req, res) => {
  try {
    const taxis = await Taxi.find().populate('cab').sort({ createdAt: -1 });
    res.status(200).json(taxis);
  } catch (error) {
    console.error('Error fetching taxi:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getTaxi = async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({error: 'No such taxi'})
  }
  const taxi = await Taxi.findById(id).populate('cab')
  if (!taxi) {
    return res.status(404).json({error: 'No such taxi'})
  }
  res.status(200).json(taxi)
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
            bus: selectedCab,
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
    getTaxis,
    getTaxiById,
    getAllTaxis,
    getTaxi,
};