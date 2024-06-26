// server.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const http = require('http');
const socketIo = require('socket.io');
const carpoolRoutes = require('./routes/carpoolRoutes');
const userRoutes = require('./routes/user');
const busRoutes = require('./routes/bus');
const rideRoutes = require('./routes/ride');
const bookingRoutes = require('./routes/rideBookingRoutes');
const carpoolBookingRoutes = require('./routes/bookingRoutes')
const busDetailsRoutes = require('./routes/busDetails');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/carpools', carpoolRoutes);
app.use('/api/user', userRoutes);
app.use('/api/bus', busRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/details', busDetailsRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/carpoolBookings', carpoolBookingRoutes);

const server = http.createServer(app);
const io = socketIo(server);

module.exports.io = io;
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
