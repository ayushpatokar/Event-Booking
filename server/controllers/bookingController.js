const Booking = require("../models/Bookings");
const OTP = require("../models/OTP");
const Event = require("../models/Event");
const { sendOtpEmail, sendBookingEmail } = require("../utils/email");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.sendBookingOTP = async (req, res) => {
  const otp = generateOTP();
  await OTP.findOneAndDelete({ email: req.body.email, action: "event booking" });
  await OTP.create({ email: req.body.email, otp, action: "event booking" });
  await sendOtpEmail(req.body.email, otp, "event booking");
  res.status(200).json({ message: "OTP sent to email" });
}

exports.bookEvent = async (req, res) => {
  const {eventId, otp} = req.body;

  const otpRecord = await OTP.findOne({ email: req.user.email, otp, action: "event booking" });
  if (!otpRecord) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  if (event.availableSeats <= 0) {
    return res.status(400).json({ error: "No available seats" });
  }

  const existingBooking = await Booking.findOne({ user: req.user._id, event: eventId });

  if (existingBooking) {
    return res.status(400).json({ error: "You have already booked this event" });
  }

  const booking = await Booking.create({ userId: req.user._id, eventId, status:'pending',
    paymentStatus: 'non_paid', amount: event.ticketPrice });

await OTP.deleteMany({ email: req.user.email, action: "event booking" });
  res.status(201).json({ message: "Booking successful. Please check your email for payment instructions.", bookingId: booking._id });
}

exports.confirmBooking = async (req, res) => {
  const paymentStatus = req.body.paymentStatus;
  if (!['paid', 'non_paid'].includes(paymentStatus)) {
    return res.status(400).json({ error: "Invalid payment status" });
  }
  const booking = await Booking.findById(req.params.id).populate('eventId');
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  if(booking.status === 'confirmed'){
    return res.status(400).json({ error: "Booking is already confirmed" });
  }

  const event = await Event.findById(booking.eventId._id);
  if (event.totalSeats <= 0) {
    return res.status(400).json({ error: "No available seats" });
  }

  booking.status = 'confirmed';
  if(paymentStatus){
    booking.paymentStatus = paymentStatus;
  }
  await booking.save();
  event.totalSeats -= 1;
  await event.save();

  //admin confirm booking. send email to user
  await sendBookingEmail(req.user.email, event.title, booking._id);

  res.json({message: 'Booking confirmed'});
}

exports.getMyBookings = async (req, res) =>{
  const Booking = await Booking.find({userId: req.user._id}).populate('eventid');
  res.json(bookings);
}

exports.cancelBooking = async (req, res) =>{
  const booking = await Booking.findById(req.params.id);
  if(!booking) {
    return res.status(404).json({error: 'Booking not found'});
  }

  if(booking.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({error: 'Unauthorized'});
  }  

  booking.status = 'cancelled';
  await booking.save();

  if(booking.status === 'confirmed') {
    const event = await Event.findById(booking.eventId._id);
    event.totalSeats += 1;
    await event.save();
  }

  await booking.remove();
  res.json({message: 'Booking cancelled'});
}