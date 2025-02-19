const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'StockItems', required: true },
  itemName: { type: String },
  quantityRequested: { type: Number, default: 0 },
  quantityReceived: { type: Number },
  observation: { type: String },
});

const UserRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User ', required: true },
  department: { type: String, required: true },
  service: { type: String, required: true },
  items: [itemSchema],
  hodName: { type: String, required: true },
  hodSignature: { type: String },
  clicked: { type: Boolean, default: false },  // Display new request word before click
  date: { type: Date },
  // New fields for user verification with default values

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
  // New status field
  status: { type: String, required: true, default: 'Pending' }, // Default status can be 'pending'

  createdAt: {
    type: Date,
 default: Date.now
  },
});

// Pre-save middleware to set quantityReceived to quantityRequested if not provided
UserRequestSchema.pre('save', function(next) {
  this.items.forEach(item => {
    if (item.quantityReceived === undefined || item.quantityReceived === null) {
      item.quantityReceived = item.quantityRequested;
    }
  });
  next();
});

// // Pre-update middleware to ensure quantityReceived matches quantityRequested if updated
// UserRequestSchema.pre('findOneAndUpdate', async function(next) {
//   const update = this.getUpdate();
  
//   // Check if items are being updated
//   if (update.items) {
//     const updatedItems = update.items.map(item => {
//       // Ensure quantityReceived is set to quantityRequested if quantityRequested is updated
//       if (item.quantityRequested !== undefined) {
//         item.quantityReceived = item.quantityRequested;
//       }
//       return item;
//     });
//     update.items = updatedItems;
//   }

//   next();
// });

module.exports = mongoose.model('UserRequest', UserRequestSchema);