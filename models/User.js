const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
  fiscalCode: String
});

const User = mongoose.model('users', UserSchema);

module.exports = User;
