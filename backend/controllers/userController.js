import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateToken } from '../utils/generateToken.js';
import transporter from '../config/email.js';
import asyncHandler from 'express-async-handler';

const searchUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword || '';
  const limit = Number(req.query.limit) || 10; 
  const page = Number(req.query.page) || 1;
  const skip = (page - 1) * limit;

  const filter = {
    name: { $regex: keyword, $options: 'i' },
  };

  const total = await User.countDocuments(filter);

  const users = await User.find(filter)
    .select('name _id email profilePic bio') 
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 }); 

  res.json({
    users,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
});

const getUserByName = asyncHandler(async (req, res) => {
  const user = await User.findOne({ name: req.params.name }).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const updateUserBio = async (req, res) => {
  const userId = req.user._id;

  console.log("Received bio update request");
  console.log("req.body:", req.body);
  console.log("req.user:", req.user);
  const { bio } = req.body;

   if (!bio || typeof bio !== 'string') {
    return res.status(400).json({ message: 'Bio is required and must be a string' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.bio = bio || '';
    await user.save();

    res.status(200).json({ message: 'Bio updated successfully', bio: user.bio });
  } catch (error) {
    console.error("❌ Server error in updateUserBio:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const uploadProfileImage = asyncHandler(async (req, res) => {
  console.log('📸 Hit uploadProfileImage route');
  if (!req.file) {
    console.log('⚠️ No file received');
    res.status(400);
    throw new Error('No file uploaded');
  }

  console.log('🧑 req.user:', req.user);
  console.log('📂 req.file:', req.file);

  const user = await User.findById(req.user._id);
  console.log('Updated from DB:', user);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.profilePic = `/pfpuploads/${req.file.filename}`;
  await user.save();
  console.log("✅ ProfilePic saved as:", user.profilePic);

  res.status(200).json({
    message: 'Profile picture uploaded successfully',
    profilePic: user.profilePic,
  });
});

const removeProfileImage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const fs = await import('fs');
  const path = await import('path');

  if (user.profilePic) {
    const imagePath = path.resolve(`.${user.profilePic}`); 
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath); 
    }
    user.profilePic = '';
    await user.save();
  }

  res.status(200).json({ message: 'Profile picture removed' });
});

const loginUser = async (req, res, next) => {
  try {
    console.log("login stuff works");
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.statusCode = 404;
      throw new Error(
        'Invalid email address. Please check your email and try again.'
      );
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      res.statusCode = 401;
      throw new Error(
        'Invalid password. Please check your password and try again.'
      );
    }

    generateToken(req, res, user._id);

    res.status(200).json({
      message: 'Login successful.',
      userId: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    next(error);
  }
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.statusCode = 409;
      throw new Error('User already exists. Please choose a different email.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    generateToken(req, res, user._id);

    res.status(201).json({
      message: 'Registration successful. Welcome!',
      userId: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    next(error);
  }
};

const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0), 
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.statusCode = 404;
      throw new Error('User not found!');
    }

    res.status(200).json({
      message: 'User profile retrieved successfully',
      userId: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      profilePic: user.profilePic || '',
      bio: user.bio,
      customId: user.customId
    });
  } catch (error) {
    next(error);
  }
};

const admins = async (req, res, next) => {
  try {
    const admins = await User.find({ isAdmin: true });

    if (!admins || admins.length === 0) {
      res.statusCode = 404;
      throw new Error('No admins found!');
    }
    res.status(200).json(admins);
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isAdmin: false });

    if (!users || users.length === 0) {
      res.statusCode = 404;
      throw new Error('No users found!');
    }
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id: userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      res.statusCode = 404;
      throw new Error('User not found!');
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: 'Internal Server Error'
    });
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, email, isAdmin } = req.body;
    const { id: userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      res.statusCode = 404;
      throw new Error('User not found!');
    }
    user.name = name || user.name;
    user.email = email || user.email;
    user.isAdmin = Boolean(isAdmin);

    const updatedUser = await user.save();

    res.status(200).json({ message: 'User updated', updatedUser });
  } catch (error) {
    res.status(500).json({
      message: 'Internal Server Error'
    });
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      res.statusCode = 404;
      throw new Error('User not found. Unable to update profile.');
    }

    user.name = name || user.name;
    user.email = email || user.email;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: 'User profile updated successfully.',
      userId: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id: userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      res.statusCode = 404;
      throw new Error('User not found!');
    }
    await User.deleteOne({ _id: user._id });
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

const resetPasswordRequest = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.statusCode = 404;
      throw new Error('User not found!');
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '15m'
    });
    const passwordResetLink = `https://mern-shop-abxs.onrender.com/reset-password/${user._id}/${token}`;
    console.log(passwordResetLink);
    await transporter.sendMail({
      from: `"MERN Shop" ${process.env.EMAIL_FROM}`, // sender address
      to: user.email, // list of receivers
      subject: 'Password Reset', // Subject line
      html: `<p>Hi ${user.name},</p>

            <p>We received a password reset request for your account. Click the link below to set a new password:</p>

            <p><a href=${passwordResetLink} target="_blank">${passwordResetLink}</a></p>

            <p>If you didn't request this, you can ignore this email.</p>

            <p>Thanks,<br>
            MERN Shop Team</p>` // html body
    });

    res
      .status(200)
      .json({ message: 'Password reset email sent, please check your email.' });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { id: userId, token } = req.params;
    const user = await User.findById(userId);
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken) {
      res.statusCode = 401;
      throw new Error('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password successfully reset' });
  } catch (error) {
    next(error);
  }
};

export {
  loginUser,
  registerUser,
  logoutUser,
  getUserProfile,
  getUsers,
  getUserById,
  updateUser,
  updateUserProfile,
  deleteUser,
  admins,
  resetPasswordRequest,
  resetPassword,
  uploadProfileImage,
  removeProfileImage,
  updateUserBio,
  getUserByName,
  searchUsers
  
};