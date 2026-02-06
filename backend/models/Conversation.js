import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    unreadCounts: {
      type: Map,
      of: Number,
      default: {} 
    },
    lastMessage: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Message' 
    },

  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ members: 1 }, { unique: false });

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;