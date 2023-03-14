import mongoose from 'mongoose'

const deletedUserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  gender: { type: String },
  dateOfBirth: { type: String },
  address: { type: String },
  country: { type: String },
  city: { type: String },
  region: { type: String },
  postalCode: { type: String },
  accountType: { type: String },
  paymentMode: { type: String },
  loginCode: { type: String },
  stripeCustomerId: { type: String, required: true },
});

const DeletedUserSchema = mongoose.model('DeletedUser', deletedUserSchema)

export default DeletedUserSchema