const express = require('express');
const router = express.Router();
const {
  createTaxi,
  getTaxis,
  getTaxiById,
  getAllTaxis,
  getTaxi,
  calculateRidePrice,
} = require('../controllers/taxiController');
const requireAuth = require('../middleware/taxiRequireAuth');
router.use('/authenticated', requireAuth);
router.get('/authenticated', getTaxis);
router.get('/taxi/:taxiId', getTaxiById);
router.get('/', getAllTaxis);
router.get('/:id', getTaxi);
router.post('/authenticated', createTaxi);

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
