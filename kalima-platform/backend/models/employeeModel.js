const mongoose = require('mongoose');
const User = require('./userModel');

const employeeSchema = new mongoose.Schema({
  // if any fields are to be added to the employee schema, they can be added here
}, {
  timestamps: true
});

const Employee = User.discriminator('Employee', employeeSchema);

module.exports = Employee;