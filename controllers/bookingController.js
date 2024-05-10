const Booking = require('../models/booking');
exports.createBooking = async (req, res) => {
  try {
    const { carpoolId, passenger, selectedPassengers } = req.body;
    const newBooking = new Booking({
      carpoolId,
      passenger,
      selectedPassengers,
    });
    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (error) {
    console.error('MongoDB Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getBookingsByPostId = async (req, res) => {
  const postId = req.params.postId;
  try {
    const bookings = await Booking.find({ carpoolId: postId });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
