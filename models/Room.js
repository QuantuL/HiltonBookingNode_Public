const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  hotel: {
    _id: { type: mongoose.Schema.Types.ObjectId},
    name: { type: String },
    city: { type: String },
    postalCode: { type: String },
    address: { type: String },
    rating: { type: String }
  },
  roomnumber: String,
  type: String,
  price: Number
});

const Room = mongoose.model('rooms', RoomSchema);

module.exports = Room;
