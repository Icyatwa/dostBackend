// // rideBookingController.js
// const RideBooking = require('../models/rideBookingModel');
// const BusDetails = require('../models/busDetailsModel');
// const Ride = require('../models/rideModel')

// const bookRide = async (req, res) => {
//   const { ride_id, seatsBooked } = req.body;
//   try {
//     const ride = await Ride.findById(ride_id);
//     if (!ride) {
//       return res.status(404).json({ error: 'Ride not found' });
//     }

//     const booking = await RideBooking.create({
//       ride: ride_id,
//       seatsBooked
//     });

//     const updatedBusDetails = await BusDetails.findOneAndUpdate(
//       { rideGroupId: ride.rideGroupId },
//       { $inc: { busCapacity: -seatsBooked } },
//       { new: true }
//     );

//     res.status(201).json({ booking, updatedBusDetails });
//   } catch (error) {
//     console.error('Error booking ride:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// module.exports = { bookRide };


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

    // Retrieve the bus details associated with this ride's rideGroupId
    const busDetails = await BusDetails.findOne({ rideGroupId: ride.rideGroupId });
    if (!busDetails) {
      return res.status(404).json({ error: 'Bus details not found' });
    }

    // Update bus capacity only for the segment's starting and ending stations
    const stations = ride.stations;
    const startStation = stations[0];
    const endStation = stations[stations.length - 1];

    // Filter rides by those starting or ending at the same stations
    const ridesToUpdate = await Ride.find({
      rideGroupId: ride.rideGroupId,
      $or: [
        { stations: { $all: [startStation, endStation] } },
        { stations: { $all: [endStation, startStation] } }
      ]
    });

    // Update bus capacity for each relevant ride
    for (const rideToUpdate of ridesToUpdate) {
      const updatedBusDetails = await BusDetails.findOneAndUpdate(
        { rideGroupId: rideToUpdate.rideGroupId },
        { $inc: { busCapacity: -seatsBooked } },
        { new: true }
      );
    }

    res.status(201).json({ message: 'Booking successful' });
  } catch (error) {
    console.error('Error booking ride:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



module.exports = { bookRide };

