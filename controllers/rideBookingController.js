// const mongoose = require('mongoose');
// const Ride = require('../models/rideModel');
// const RideBooking = require('../models/rideBookingModel');
// const BusDetails = require('../models/busDetailsModel');

// const bookRide = async (req, res) => {
//   const { ride_id, seatsBooked } = req.body;
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const ride = await Ride.findById(ride_id).session(session);
//     if (!ride) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({ error: 'Ride not found' });
//     }

//     const booking = await RideBooking.create([{ 
//       ride: ride_id, 
//       seatsBooked 
//     }], { session });

//     const busDetails = await BusDetails.findOne({ rideGroupId: ride.rideGroupId }).session(session);
//     if (!busDetails) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({ error: 'Bus details not found' });
//     }

//     const startStation = ride.stations[0];
//     const endStation = ride.stations[1];

//     const segmentsToUpdate = new Set();

//     // Find all segments that start at the same station
//     const ridesWithSameStart = await Ride.find({ 
//       rideGroupId: ride.rideGroupId, 
//       'stations.0': startStation 
//     }).session(session);
//     ridesWithSameStart.forEach(ride => {
//       segmentsToUpdate.add(`${ride.stations[0]}-${ride.stations[1]}`);
//     });

//     // Find all segments that end at the same station
//     const ridesWithSameEnd = await Ride.find({ 
//       rideGroupId: ride.rideGroupId, 
//       'stations.1': endStation 
//     }).session(session);
//     ridesWithSameEnd.forEach(ride => {
//       segmentsToUpdate.add(`${ride.stations[0]}-${ride.stations[1]}`);
//     });

//     segmentsToUpdate.forEach(segmentKey => {
//       if (!busDetails.segmentCapacities.has(segmentKey)) {
//         busDetails.segmentCapacities.set(segmentKey, busDetails.busCapacity);
//       }

//       const currentCapacity = busDetails.segmentCapacities.get(segmentKey);
//       const updatedCapacity = currentCapacity - seatsBooked;

//       if (updatedCapacity < 0) {
//         throw new Error('Not enough capacity available for the booking');
//       }

//       busDetails.segmentCapacities.set(segmentKey, updatedCapacity);
//     });

//     await busDetails.save({ session });
//     await session.commitTransaction();
//     session.endSession();

//     res.status(201).json({ booking, updatedBusDetails: busDetails });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error('Error booking ride:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// module.exports = { bookRide };


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
      // Ensure segment direction matches
      if (ride.stations[1] !== endStation) {
        segmentsToUpdate.add(`${ride.stations[0]}-${ride.stations[1]}`);
      }
    });

    // Find all segments that end at the same station
    const ridesWithSameEnd = await Ride.find({ 
      rideGroupId: ride.rideGroupId, 
      'stations.1': endStation 
    }).session(session);
    ridesWithSameEnd.forEach(ride => {
      // Ensure segment direction matches
      if (ride.stations[0] !== startStation) {
        segmentsToUpdate.add(`${ride.stations[0]}-${ride.stations[1]}`);
      }
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
