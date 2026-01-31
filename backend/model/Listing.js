import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  commodity: {
    type: String,
    required: true
  },
  variety: String,
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    enum: ['kg', 'quintal', 'ton'],
    default: 'kg'
  },
  expectedPrice: {
    type: Number,
    required: true
  },
  description: String,
  location: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;
