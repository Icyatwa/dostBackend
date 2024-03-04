// server.js

const express = require('express');
const cors = require('cors');
const rideRoutes = require('./routes/rideRoutes');
const expressRoutes = require('./routes/expressRoutes');
const busRoutes = require('./routes/busRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const authRoutes = require('./routes/expressAuthRoutes'); // Import authentication routes
const connectDB = require('./config/database');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/rides', rideRoutes);
app.use('/api/expressRides', expressRoutes);
app.use('/api/bus', busRoutes);
app.use('/api/bookings', bookingRoutes);

// Include authentication routes
app.use('/api/auth', authRoutes);

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
