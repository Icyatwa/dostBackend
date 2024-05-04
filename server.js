// const express = require('express');
// const cors = require('cors');
// const connectDB = require('./config/database');
// const http = require('http');
// const socketIo = require('socket.io');
// const carpoolRoutes = require('./routes/carpoolRoutes');
// const userRoutes = require('./routes/user')
// const busRoutes = require('./routes/bus')
// const rideRoutes = require('./routes/ride')
// const busBookingRoutes = require('./routes/busBooking')

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());

// app.use('/api/carpools', carpoolRoutes);
// app.use('/api/user', userRoutes)
// app.use('/api/bus', busRoutes)
// app.use('/api/rides', rideRoutes)
// app.use('/api/bookings', busBookingRoutes)

// const server = http.createServer(app);
// const io = socketIo(server);

// module.exports.io = io;
// connectDB()
//   .then(() => {
//     server.listen(PORT, () => {
//       console.log(`Server is running on port ${PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.log(error);
//   });



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
const bookingRoutes = require('./routes/busBooking'); // New

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/carpools', carpoolRoutes);
app.use('/api/user', userRoutes);
app.use('/api/bus', busRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/bookings', bookingRoutes); // New

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
