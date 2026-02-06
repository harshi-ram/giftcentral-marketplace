import mongoose from 'mongoose';

const mailboxSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
  giftRequest: { type: mongoose.Schema.Types.ObjectId, ref: "GiftRequest", required: true },
  type: { type: String, enum: ["accepted", "declined"], required: true },
  read: { type: Boolean, default: false }
}, { timestamps: true });



export default mongoose.model('Mailbox', mailboxSchema);
