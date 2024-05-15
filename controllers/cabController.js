const Cab = require('../models/cabModel')
const mongoose = require('mongoose')

const getCabs = async (req, res) => {
  const taxiDriver_id = req.taxiDriver._id
  const cabs = await Cab.find({taxiDriver_id})
    .sort({createdAt: -1})
  res.status(200).json(cabs)
}

const getAllCabs = async (req, res) => {
  try {
    const cabs = await Cab.find().sort({ createdAt: -1 });
    res.status(200).json(cabs);
  } catch (error) {
    console.error('Error fetching cabs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getCab = async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({error: 'No such cab'})
  }
  const cab = await Cab.findById(id)
  if (!cab) {
    return res.status(404).json({error: 'No such cab'})
  }
  res.status(200).json(cab)
}

const createCab = async (req, res) => {
  const { driver, licensePlates, model, capacity } = req.body;
  let emptyFields = [];
  if (!driver) {
    emptyFields.push('driver');
  }
  if (!licensePlates) {
    emptyFields.push('licensePlates');
  }
  if (!model) {
    emptyFields.push('model');
  }
  if (!capacity) {
    emptyFields.push('capacity');
  }
  if (emptyFields.length > 0) {
    return res.status(400).json({ error: 'Please fill in all the fields', emptyFields });
  }
  try {
    const taxiDriver_id = req.taxiDriver._id;
    const cab = await Cab.create({ 
      driver,
      licensePlates,
      model,
      capacity,
      taxiDriver_id
    });
    res.status(200).json(cab);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
  
const updateCab = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such cab' });
  }
  try {
    const existingCab = await Cab.findById(id);
    if (!existingCab) {
      return res.status(404).json({ error: 'No such cab' });
    }
    const updatedCab = await Cab.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedCab);
  } catch (error) {
    console.error('Error updating cab:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

  

const deleteCab = async (req, res) => {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such cab'})
    }
    const cab = await Cab.findOneAndDelete({_id: id})
    if (!cab) {
        return res.status(400).json({error: 'No such cab'})
    }
    res.status(200).json(cab)
}

module.exports = {
    getCabs,
    getAllCabs,
    getCab,
    createCab,
    updateCab,
    deleteCab,
}