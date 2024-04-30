const express = require('express')
const {
    getBuses,
    getAllBuses,
    getBus,
    createBus,
    deleteBus,
    updateBus
} = require('../controllers/busController')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

// require auth for all workout routes
router.use('/authsBus', requireAuth);

// GET all buses for authenticated users
router.get('/authsBus', getBuses);

// GET all buses for unauthenticated users
router.get('/', getAllBuses);

//GET a single bus
router.get('/:id', getBus)

// POST a new bus
router.post('/authsBus', createBus)

// DELETE a bus
router.delete('/:id', deleteBus)

// UPDATE a bus
router.patch('/:id', updateBus)


module.exports = router