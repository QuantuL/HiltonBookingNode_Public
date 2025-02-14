const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  customer: {
    fiscalCode: { type: String }
  },
  hotel: {
    _id: { type: mongoose.Schema.Types.ObjectId},
    name: { type: String }
  },
  resroom: {
    _id: { type: mongoose.Schema.Types.ObjectId},
    roomnumber: { type: String },
    type: { type: String }
  },
  checkin: Date,
  checkout: Date,
  totalPrice:Number,
  people: Number
});

const Reservation = mongoose.model('reservations', reservationSchema);

module.exports = Reservation;