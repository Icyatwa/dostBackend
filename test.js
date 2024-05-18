// busDetailsModel.js
const mongoose = require('mongoose');

const busDetailsModel = new mongoose.Schema({
  rideGroupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  busCapacity: { type: Number, required: true },
  busPlates: { type: Number }
});

module.exports = mongoose.model('BusDetails', busDetailsModel);




// busDetailsController.js

const BusDetails = require('../models/busDetailsModel');

const getBusDetails = async (req, res) => {
  try {
    const busDetails = await BusDetails.find();
    res.json(busDetails);
  } catch (error) {
    console.error('Error fetching bus details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getBusDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    const busDetails = await BusDetails.findOne({ rideGroupId: id }); // Find by rideGroupId
    if (!busDetails) {
      return res.status(404).json({ error: 'Bus details not found' });
    }
    res.json(busDetails);
  } catch (error) {
    console.error('Error fetching bus details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports = {
  getBusDetails,
  getBusDetailsById
};



// rideModel.js

const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true},
  stations: { type: [String], required: true },
  time: { type: String },
  price: { type: Number },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  publishSchedule: { type: [Object] },
  rideGroupId: { type: mongoose.Schema.Types.ObjectId, required: true },
  bookedSeats: { type: Map, of: Number, default: {} }
}, { timestamps: true });

const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride;




const Bus = require('../models/busModel');
const Ride = require('../models/rideModel');
const mongoose = require('mongoose');
const BusDetails = require('../models/busDetailsModel')

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
};


// rideBookingModel.js
const mongoose = require('mongoose');

const rideBookingSchema = new mongoose.Schema({
  ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  seatsBooked: { type: Number, required: true },
  bookingDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RideBooking', rideBookingSchema);




// rideBookingController.js
const RideBooking = require('../models/rideBookingModel');
const BusDetails = require('../models/busDetailsModel');
const Ride = require('../models/rideModel')

const bookRide = async (req, res) => {
  const { ride_id, seatsBooked } = req.body;
  try {
    const ride = await Ride.findById(ride_id);
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    const booking = await RideBooking.create({
      ride: ride_id,
      seatsBooked
    });

    const updatedBusDetails = await BusDetails.findOneAndUpdate(
      { rideGroupId: ride.rideGroupId },
      { $inc: { busCapacity: -seatsBooked } },
      { new: true }
    );

    res.status(201).json({ booking, updatedBusDetails });
  } catch (error) {
    console.error('Error booking ride:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { bookRide };


// Booking.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Booking = () => {
  const { rideId } = useParams();
  const [ride, setRide] = useState({ bus: { capacity: 0 } });
  const [busDetails, setBusDetails] = useState({});
  const [seatsBooked, setSeatsBooked] = useState(0);

  const handleBooking = async () => {
    try {
      const response = await axios.post(`https://dostbackend.onrender.com/api/bookings`, {
        ride_id: rideId,
        seatsBooked
      });
      // Handle success, maybe show a message to the user
    } catch (error) {
      console.error('Error booking ride:', error);
    }
  };

  useEffect(() => {
    const fetchRideDetails = async () => {
      try {
        const response = await axios.get(`https://dostbackend.onrender.com/api/rides/${rideId}`);
        setRide(response.data);
    
        // Fetch bus details using rideGroupId
        const busDetailsResponse = await axios.get(`https://dostbackend.onrender.com/api/details/${response.data.rideGroupId}`); // Ensure correct URL
        setBusDetails(busDetailsResponse.data);
      } catch (error) {
        console.error('Error fetching ride data', error);
      }
    };
    if (rideId) {
      fetchRideDetails();
    } else {
      console.error('Error: Ride ID not provided');
    }
  }, [rideId]);

  if (!ride || !ride.stations || !busDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <p>Available Capacity: {busDetails.busCapacity}</p>
      <h2>Book Seats</h2>
      <input
        type="number"
        min="1"
        max={busDetails.busCapacity}
        value={seatsBooked}
        onChange={(e) => setSeatsBooked(parseInt(e.target.value))}
      />
      <button onClick={handleBooking}>Book Seats</button>
    </div>
  );
};

export default Booking;


i want that if i click to book a ride, as you can see the number of
seats in the frontend gets reduced according to the number i inserted
but now i want that if i book for a ride the decrementation of seats should affect
only the rides with the same direction, eg: there are segments with one RideGroupId
which are A to B , B to A , A to C, C to A , B to C , C to B because they share one RideGroupdId that means
they will share one bus at journeys so if i book for the segment A to B the decrementation
should work for the rides that doesn't have the same location as mine like B to A , B to C, C to B, C to A
but for the rides like A to B, A to C those ones their seats should be decremented which also means if the seats
totaly was 30 and i book for 2 seats only the rides B to A , B to C, C to B, C to A should keep having the full 30 seats
but the rides A to B, A to C should remain with 28 seats, but the reason your changes might not work the reason is because it will decrement
the seats in the database and remember that the segment shares on bus that's why ,
 i hope you get it now i command you to provide codes to do it