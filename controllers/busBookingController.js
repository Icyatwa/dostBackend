bookingController.js
const Booking = require('../models/busBookingModel');

const createBooking = async (req, res) => {
  const { rideId, user, seatsBooked, totalPrice } = req.body;

  try {
    const booking = await Booking.create({
      ride: rideId,
      user,
      seatsBooked,
      totalPrice,
    });
    res.status(200).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getBookingsForRide = async (req, res) => {
  const { rideId } = req.params;
  try {
    const bookings = await Booking.find({ ride: rideId });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings for ride:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createBooking,
  getBookingsForRide,
};


// const Booking = require('../models/busBookingModel');

// const createBooking = async (req, res) => {
//   const { rideId, user, seatsBooked, totalPrice } = req.body;

//   try {
//     // Assuming rideId contains information about the entire ride route
//     const ride = await Ride.findById(rideId).populate('bus');

//     if (!ride) {
//       return res.status(404).json({ error: 'Ride not found' });
//     }

//     // Calculate availability for subsequent segments based on seatsBooked
//     // Update ride capacity for each segment accordingly
//     // For simplicity, assuming seatsBooked is an array of objects containing segment info
//     seatsBooked.forEach(segment => {
//       ride.stations.forEach((station, index) => {
//         if (station === segment.from) {
//           for (let i = index; i < ride.stations.length - 1; i++) {
//             ride.capacity[`${ride.stations[i]}-${ride.stations[i + 1]}`] -= segment.seats; // Adjust seat availability for subsequent segments
//           }
//         }
//       });
//     });

//     // Check if there are enough seats available for all segments
//     const isSeatsAvailable = ride.stations.every((station, index) => {
//       if (index < ride.stations.length - 1) {
//         return ride.capacity[`${station}-${ride.stations[index + 1]}`] >= 0;
//       }
//       return true;
//     });

//     if (!isSeatsAvailable) {
//       return res.status(400).json({ error: 'Seats not available for the entire route' });
//     }

//     // Proceed with booking
//     const booking = await Booking.create({
//       ride: rideId,
//       user,
//       seatsBooked,
//       totalPrice,
//     });

//     res.status(200).json(booking);
//   } catch (error) {
//     console.error('Error creating booking:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// module.exports = {
//   createBooking,
// };

