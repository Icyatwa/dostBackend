// rideModel.js
const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  stations: { type: [String], required: true },
  time: { type: String },
  price: { type: Number },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  publishSchedule: { type: [Object] },
  rideGroupId: { type: mongoose.Schema.Types.ObjectId, required: true },
  bookedSeats: { type: Number, default: 0 }  // Track booked seats
}, { timestamps: true });

const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride;

// rideController.js
const Bus = require('../models/busModel');
const Ride = require('../models/rideModel');
const mongoose = require('mongoose');
const BusDetails = require('../models/busDetailsModel');

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
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such ride' });
  }
  const ride = await Ride.findById(id).populate('bus');
  if (!ride) {
    return res.status(404).json({ error: 'No such ride' });
  }
  res.status(200).json(ride);
};

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

    if (existingRidesFromAB.length >= selectedBus.capacity) {
      return res.status(400).json({ error: 'Seats are full from station A to station B' });
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

            const ride = await Ride.create({
              bus: selectedBus,
              stations: [stations[i], stations[j]],
              time,
              price: ridePrice ? ridePrice : null,
              user_id,
              rideGroupId,
              publishSchedule: []
            });
            rides.push(ride);
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

          const ride = await Ride.create({
            bus: selectedBus,
            stations: [stations[i], stations[j]],
            time,
            price: ridePrice ? ridePrice : null,
            user_id,
            rideGroupId,
            publishSchedule: schedule.type === 'scheduled' ? schedule.times : []
          });
          rides.push(ride);
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

module.exports = {
  createRide,
  calculateRidePrice,
  getRides,
  getRideById,
  getAllRides,
  getRide,
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
const mongoose = require('mongoose');
const Ride = require('../models/rideModel');
const RideBooking = require('../models/rideBookingModel');
const BusDetails = require('../models/busDetailsModel');

const bookRide = async (req, res) => {
  const { ride_id, seatsBooked } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ride = await Ride.findById(ride_id).session(session);
    if (!ride) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Ride not found' });
    }

    const booking = await RideBooking.create([{ 
      ride: ride_id, 
      seatsBooked 
    }], { session });

    const busDetails = await BusDetails.findOne({ rideGroupId: ride.rideGroupId }).session(session);
    if (!busDetails) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Bus details not found' });
    }

    const startStation = ride.stations[0];
    const endStation = ride.stations[1];

    const segmentsToUpdate = new Set();

    // Find all segments that start at the same station
    const ridesWithSameStart = await Ride.find({ 
      rideGroupId: ride.rideGroupId, 
      'stations.0': startStation 
    }).session(session);
    ridesWithSameStart.forEach(ride => {
      segmentsToUpdate.add(`${ride.stations[0]}-${ride.stations[1]}`);
    });

    // Find all segments that end at the same station
    const ridesWithSameEnd = await Ride.find({ 
      rideGroupId: ride.rideGroupId, 
      'stations.1': endStation 
    }).session(session);
    ridesWithSameEnd.forEach(ride => {
      segmentsToUpdate.add(`${ride.stations[0]}-${ride.stations[1]}`);
    });

    segmentsToUpdate.forEach(segmentKey => {
      if (!busDetails.segmentCapacities.has(segmentKey)) {
        busDetails.segmentCapacities.set(segmentKey, busDetails.busCapacity);
      }

      const currentCapacity = busDetails.segmentCapacities.get(segmentKey);
      const updatedCapacity = currentCapacity - seatsBooked;

      if (updatedCapacity < 0) {
        throw new Error('Not enough capacity available for the booking');
      }

      busDetails.segmentCapacities.set(segmentKey, updatedCapacity);
    });

    await busDetails.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ booking, updatedBusDetails: busDetails });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
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
  const [segmentCapacity, setSegmentCapacity] = useState(0);
  const [seatsBooked, setSeatsBooked] = useState(0);

  const handleBooking = async () => {
    try {
      const response = await axios.post(`https://dostbackend.onrender.com/api/bookings`, {
        ride_id: rideId,
        seatsBooked
      });
      // Handle success, update bus details
      const updatedBusDetails = response.data.updatedBusDetails;
      setBusDetails(updatedBusDetails);
      setSegmentCapacity(updatedBusDetails.segmentCapacities[`${ride.stations[0]}-${ride.stations[1]}`]);
      setSeatsBooked(0); // Reset the seats booked
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
        const busDetailsResponse = await axios.get(`https://dostbackend.onrender.com/api/details/${response.data.rideGroupId}`);
        setBusDetails(busDetailsResponse.data);
        setSegmentCapacity(busDetailsResponse.data.segmentCapacities[`${response.data.stations[0]}-${response.data.stations[1]}`] || busDetailsResponse.data.busCapacity);
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
      <p>Available Capacity: {segmentCapacity}</p>
      <h2>Book Seats</h2>
      <input
        type="number"
        min="1"
        max={segmentCapacity}
        value={seatsBooked}
        onChange={(e) => setSeatsBooked(parseInt(e.target.value))}
      />
      <button onClick={handleBooking}>Book Seats</button>
    </div>
  );
};

export default Booking;


everything is working fine, but as
you know when creating a ride the system
breaks it into A to B and  B to A, so i have an issue
because when i'm booking and the segments of A to B when one of the station
matches with one from B to A it affects the B to A
segment and it shouldn't the A to B segments should work
separately with its reversed B to A segments, let's say i create a ride
A - B - C - D, the system will break it into :
A to B, "B to A", A to C, "C to A", A to D, "D to A", 
B to C, "C to A", B to D, "D to B", C to D, "D to C". so as you can see
those ones i quoted are the reverse i was talking about the bus will go and the bus might come back
