import GiftRequest from '../models/GiftRequest.js';
import User from '../models/userModel.js';
import Mailbox from "../models/Mailbox.js";

export const getMailbox = async (req, res) => {
  try {
    const pageSize = 5; 
    const page = Number(req.query.pageNumber) || 1;

    const count = await Mailbox.countDocuments({ user: req.user._id });

    const items = await Mailbox.find({ user: req.user._id })
      .populate({
        path: "giftRequest",
        populate: [
          { path: "sender", select: "name email" },
          { path: "recipient", select: "name email" }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(pageSize)      
      .skip(pageSize * (page - 1)); 

    res.json({ 
      items, 
      page, 
      pages: Math.ceil(count / pageSize) 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch mailbox" });
  }
};



export const markMailboxAsRead = async (req, res) => {
  try {
    await Mailbox.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.json({ message: "All mailbox items marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to mark mailbox as read" });
  }
};



export const createGiftRequest = async (req, res) => {
  console.log("creategiftrequest test");
  try {
    console.log("try test");
    const { sellerName, description, budget } = req.body;

    const recipient = await User.findOne({ name: sellerName });
    if (!recipient) {
      console.log("no recipient");
      return res.status(404).json({ message: 'Recipient not found' });
      
    }
    else{
      console.log("yes recipient");
    }

    const request = new GiftRequest({
      sender: req.user._id,
      recipient: recipient._id,
      description,
      budget,
      read: false
    });

    await request.save();

    if (req.io) {
      console.log("About to emit giftRequest:new to:", recipient._id.toString());
      req.io.to(recipient._id.toString()).emit("giftRequest:new", request);
      console.log(`Emitted giftRequest:new to ${recipient._id}`);
    }
    res.status(201).json(request);
  } catch (error) {
    console.log("catch test");
    console.error(error);
    res.status(500).json({ message: 'Failed to create gift request' });
  }
};

export const getReceivedGiftRequests = async (req, res) => {
  try {
    
    const requests = await GiftRequest.find({ recipient: req.user._id, status: { $ne: 'declined' } })
      .populate('sender', 'name email')
      .sort({ createdAt: -1 });

     const giftRequestCount = await GiftRequest.countDocuments({ 
      recipient: req.user._id, 
      status: { $ne: 'declined' }, 
      read: false 
    });


    res.json({requests, giftRequestCount});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to load gift requests' });
  }
};


export const markGiftRequestsAsRead = async (req, res) => {
  try {
    await GiftRequest.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.json({ message: 'All gift requests marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to mark as read' });
  }
};


export const acceptGiftRequest = async (req, res) => {
  try {
    const request = await GiftRequest.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!request) return res.status(404).json({ message: 'Gift request not found' });

    request.status = 'accepted';
    await request.save();

    await request.populate('sender', 'name email');

    const mailbox = await Mailbox.create({
      user: request.sender._id,
      giftRequest: request._id,
      type: 'accepted'
    });

    await mailbox.populate({
  path: "giftRequest",
  populate: [
    { path: "sender", select: "name email" },
    { path: "recipient", select: "name email" }
  ]
});

    console.log("📡 Emitting mailbox:new to room:", request.sender._id.toString());
    req.io?.to(request.sender._id.toString()).emit("mailbox:new", {
      giftRequestId: request._id,
      status: 'accepted'
    });

    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to accept gift request' });
  }
};



export const declineGiftRequest = async (req, res) => {
  try {
    const request = await GiftRequest.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!request) return res.status(404).json({ message: 'Gift request not found' });

    request.status = 'declined';
    await request.save();

    const mailbox = await Mailbox.create({
      user: request.sender._id,
      giftRequest: request._id,
      type: 'declined'
    });

     await mailbox.populate({
  path: "giftRequest",
  populate: [
    { path: "sender", select: "name email" },
    { path: "recipient", select: "name email" }
  ]
});

    console.log("📡 Emitting mailbox:new to room:", request.sender._id.toString());
    req.io?.to(request.sender._id.toString()).emit("mailbox:new", {
      giftRequestId: request._id,
      status: 'declined'
    });

    res.json({ message: 'Gift request declined', id: request._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to decline gift request' });
  }
};
