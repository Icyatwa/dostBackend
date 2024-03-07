
const Ride = require('../models/ride');

exports.createRide = async (req, res) => {
  try {
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
    
    const savedRide = await newRide.save();

    res.status(201).json(savedRide);
  } catch (error) {
    console.error('MongoDB Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find();
    res.status(200).json(rides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

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
