import mongoose from 'mongoose';

const giftRequestSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true }, 
    budget: { type: Number, required: true }, 
    status: { 
      type: String, 
      enum: ['pending', 'accepted', 'declined'], 
      default: 'pending' 
    },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model('GiftRequest', giftRequestSchema);