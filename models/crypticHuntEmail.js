const mongoose = require('mongoose');

const { Schema } = mongoose;

// create user Schema & model
const CrypticHuntSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
});

const CrypticHunt = mongoose.model('Cryptic-Hunt-Email', CrypticHuntSchema);
module.exports = CrypticHunt;
