const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'StockItems', required: true },  
  itemName: { type: String, required: true },
  quantityRequested: { type: Number, required: true },
  price: { type: Number, required: true },
  totalAmount: { type: Number, required: true }
});

const LogisticRequestSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  supplierName: { type: String, required: true },
  items: [ItemSchema],
  logisticName: { type: String, required: true },
  logisticSignature: { type: String },


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
  


const LogisticRequest = mongoose.model('LogisticRequest', LogisticRequestSchema);

module.exports = LogisticRequest;
