const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
  name: String,
  city: String,
  postalCode: String,
  address: String,
  rating: String
});

const Hotel = mongoose.model('hotels', HotelSchema);

module.exports = Hotel;
