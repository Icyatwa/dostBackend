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

router.use('/authsBus', requireAuth);
router.get('/authsBus', getBuses);
router.get('/', getAllBuses);
router.get('/:id', getBus)
router.post('/authsBus', createBus)
router.delete('/:id', deleteBus)
router.patch('/:id', updateBus)

module.exports = router