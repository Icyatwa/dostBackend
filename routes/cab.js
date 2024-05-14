const express = require('express')
const {
    getCabs,
    getAllCabs,
    getCab,
    createCab,
    deleteCab,
    updateCab
} = require('../controllers/cabController')
const requireAuth = require('../middleware/taxiRequireAuth')

const router = express.Router()

router.use('/authsCab', requireAuth);
router.get('/authsCab', getCabs);
router.get('/', getAllCabs);
router.get('/:id', getCab)
router.post('/authsCab', createCab)
router.delete('/:id', deleteCab)
router.patch('/:id', updateCab)

module.exports = router