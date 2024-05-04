const Bus = require('../models/busModel')
const mongoose = require('mongoose')

const getBuses = async (req, res) => {
  const user_id = req.user._id
  const buses = await Bus.find({user_id})
    .sort({createdAt: -1})
  res.status(200).json(buses)
}

const getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.find().sort({ createdAt: -1 });
    res.status(200).json(buses);
  } catch (error) {
    console.error('Error fetching buses:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getBus = async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({error: 'No such bus'})
  }
  const bus = await Bus.findById(id)
  if (!bus) {
    return res.status(404).json({error: 'No such bus'})
  }
  res.status(200).json(bus)
}

const createBus = async (req, res) => {
    const
        {
            driver,
            licensePlates,
            model,
            capacity,
        } = req.body
    let emptyFields = []
    if(!driver) {
        emptyFields.push('driver')
    }
    if(!licensePlates) {
        emptyFields.push('licensePlates')
    }
    if(!model) {
        emptyFields.push('model')
    }
    if(!capacity) {
        emptyFields.push('capacity')
    }
    if(emptyFields.length > 0) {
        return res.status(400).json({ error: 'Please fill in all the fields', emptyFields })
    }
    try {
        const user_id = req.user._id
        const bus = await Bus.create
            ({
                driver,
                licensePlates,
                model,
                capacity,
                user_id
            })
        res.status(200).json(bus)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

const deleteBus = async (req, res) => {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such bus'})
    }
    const bus = await Bus.findOneAndDelete({_id: id})
    if (!bus) {
        return res.status(400).json({error: 'No such bus'})
    }
    res.status(200).json(bus)
}

const updateBus = async (req, res) => {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such bus'})
    }
    try {
        const existingBus = await Bus.findById(id);
        if (!existingBus) {
            return res.status(404).json({ error: 'No such bus' });
        }
        Object.assign(existingRide, req.body);
        const updatedBus = await existingBus.save();
        res.status(200).json(updatedBus);
    } catch (error) {
        console.error('Error updating bus:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    getBuses,
    getAllBuses,
    getBus,
    createBus,
    deleteBus,
    updateBus
}