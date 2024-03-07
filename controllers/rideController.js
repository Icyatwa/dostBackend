// // controllers/rideController.js
// const Ride = require('../models/ride');

// // Create a new ride
// exports.createRide = async (req, res) => {
//   try {
//     const {
//       driverId,
//       username,
//       phoneNumber,
//       carModel,
//       licensePlates,
//       carColor,
//       location,
//       destination,
//       day,
//       time,
//       pickup,
//       dropoff,
//       seats,
//       price
//     } = req.body;
//     const newRide = new Ride({
//         driverId,
//         username,
//         phoneNumber,
//         carModel,
//         licensePlates,
//         carColor,
//         location,
//         destination,
//         day,
//         time,
//         pickup,
//         dropoff,
//         seats,
//         price
//     });
//     const savedRide = await newRide.save();


//     res.status(201).json(savedRide);
//   } catch (error) {
//     console.error('MongoDB Error:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// };

// // Get all rides
// exports.getAllRides = async (req, res) => {
//   try {
//     const rides = await Ride.find();
//     res.status(200).json(rides);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// };

// // Get rides by driverId
// exports.getRidesByDriverId = async (req, res) => {
//   const driverId = req.params.driverId;
//   try {
//     const rides = await Ride.find({ driverId });
//     res.status(200).json(rides);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// };

// exports.getRideById = async (req, res) => {
//   const rideId = req.params.rideId;
//   try {
//     const ride = await Ride.findById(rideId);
//     if (!ride) {
//       return res.status(404).json({ message: 'Ride not found' });
//     }
//     res.status(200).json(ride);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// };


// rideController.js

// Import the Ride model
const Ride = require('../models/ride');

// Create a new ride
exports.createRide = async (req, res) => {
  try {
    // Extract ride data from request body
    const {
      driverId,
      username,
      phoneNumber,
      carModel,
      licensePlates,
      carColor,
      location,
      destination,
      day,
      time,
      pickup,
      dropoff,
      seats,
      price
    } = req.body;
    
    // Create a new ride instance
    const newRide = new Ride({
        driverId,
        username,
        phoneNumber,
        carModel,
        licensePlates,
        carColor,
        location,
        destination,
        day,
        time,
        pickup,
        dropoff,
        seats,
        price
    });
    
    // Save the new ride to the database
    const savedRide = await newRide.save();

    // Send response with saved ride data
    res.status(201).json(savedRide);
  } catch (error) {
    console.error('MongoDB Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get all rides
exports.getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find();
    res.status(200).json(rides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get rides by driverId
exports.getRidesByDriverId = async (req, res) => {
  const driverId = req.params.driverId;
  try {
    const rides = await Ride.find({ driverId });
    res.status(200).json(rides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get ride by rideId
exports.getRideById = async (req, res) => {
  const rideId = req.params.rideId;
  try {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    res.status(200).json(ride);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update ride by rideId
exports.updateRide = async (req, res) => {
  const rideId = req.params.rideId;
  const updateData = req.body;
  try {
    const updatedRide = await Ride.findByIdAndUpdate(rideId, updateData, { new: true });
    if (!updatedRide) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    res.status(200).json(updatedRide);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete ride by rideId
exports.deleteRide = async (req, res) => {
  const rideId = req.params.rideId;
  try {
    const deletedRide = await Ride.findByIdAndDelete(rideId);
    if (!deletedRide) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    res.status(200).json({ message: 'Ride deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
