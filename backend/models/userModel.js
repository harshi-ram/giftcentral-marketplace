import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    customId: {
      type: Number,
      unique: true,
      index: true,
      
    },
    name: {
      type: String,
      required: true,
      unique: true
      
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false
    },
    avatar: {
      url: { type: String },
      public_id: { type: String }
    },
    bio: {
      type: String,
      maxlength: 300,
      default: ''
    },
   profilePic: {
     type: String,
     default: '',
   },

    profileLink: {
      type: String
    },

    
  },
  { timestamps: true } 
);

userSchema.pre('save', async function (next) {
  if (this.isNew) {
    const lastUser = await mongoose.model('User').findOne({}, {}, { sort: { customId: -1 } });
    this.customId = lastUser?.customId ? lastUser.customId + 1 : 1;
  }
  next();
});
const User = mongoose.model('User', userSchema);

export default User;
