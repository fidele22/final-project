const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fuelRequisitionSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User ', required: true },
  requesterName: { type: String, required: true },
  fuelType: { type: String, required: true },
  carPlaque: {
    type: String,
    required: true
  },
  kilometers: {
    type: Number,
    required: true
  },
  quantityRequested: {
    type: Number,
    required: true
  },
  quantityReceived: {
    type: Number,
    default: 0
  },
  destination: {
    type: String,
    required: false,
  },
  remainingLiters: {
    type: String,
    required: true
  },
  average: {
    type: String,
    required: true,
  },
  RequestedDate:{
    type: Date,
    required:true,
  }
,
  file: { type: String },

  status: { type: String, required: true, default: 'Pending' }, 

  createdAt: {
    type: Date,
    default: Date.now
  },
  hodName: { type: String, required: true },
  hodSignature: { type: String, required: true },
  clicked: { type: Boolean, default: false },

  verifiedBy: {

    firstName: { type: String, default: '' }, 
    lastName: { type: String, default: '' },  
    signature: { type: String, default: '' }   

  },
  // New fields for approval with default values

  approvedBy: {

    firstName: { type: String, default: '' }, 
    lastName: { type: String, default: '' },  
    signature: { type: String, default: '' }   

  },
  // New fields for receiving with default values

  receivedBy: {

    firstName: { type: String, default: '' }, 
    lastName: { type: String, default: '' },  
    signature: { type: String, default: '' }   

  },
});

// Pre-save middleware to set quantityReceived to be equal to quantityRequested
fuelRequisitionSchema.pre('save', function(next) {
  if (this.quantityReceived === undefined || this.quantityReceived === null) {
    this.quantityReceived = this.quantityRequested;
  }
  next();
});


module.exports = mongoose.model('FuelRequisition', fuelRequisitionSchema);