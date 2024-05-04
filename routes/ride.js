const express = require('express');
const router = express.Router();
const {
  createRide,
  getRides,
  getRideById,
  getAllRides,
  getRide,
  calculateRidePrice,
} = require('../controllers/rideController');
const requireAuth = require('../middleware/requireAuth');
router.use('/authenticated', requireAuth);
router.get('/authenticated', getRides);
router.get('/ride/:rideId', getRideById);
router.get('/', getAllRides);
router.get('/:id', getRide);
router.post('/authenticated', createRide);

router.post('/price', async (req, res) => {
  const { stations } = req.body;
  if (!Array.isArray(stations) || stations.length < 2) {
    return res.status(400).json({ error: 'Invalid stations provided' });
  }
  const price = calculateRidePrice(stations);
  if (price !== null) {
    res.status(200).json({ price });
  } else {
    res.status(404).json({ error: 'Price not found for the provided route' });
  }
});

module.exports = router;
