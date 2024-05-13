
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

    // Find rides with matching segments
    const ridesWithMatchingSegments = await Ride.find({
      rideGroupId: ride.rideGroupId,
      stations: { $in: ride.stations }
    });

    // Calculate total seats booked considering all matching rides
    let totalSeatsBooked = 0;
    for (const matchingRide of ridesWithMatchingSegments) {
      const bookings = await RideBooking.find({ ride: matchingRide._id });
      totalSeatsBooked += bookings.reduce((acc, curr) => acc + curr.seatsBooked, 0);
    }

    const updatedBusDetails = await BusDetails.findOneAndUpdate(
      { rideGroupId: ride.rideGroupId },
      { $inc: { busCapacity: -totalSeatsBooked } },
      { new: true }
    );

    // Create booking for the specific ride
    const booking = await RideBooking.create({
      ride: ride_id,
      seatsBooked
    });

    res.status(201).json({ booking, updatedBusDetails });
  } catch (error) {
    console.error('Error booking ride:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports = { bookRide };


module.exports = { bookRide };

