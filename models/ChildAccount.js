import mongoose from 'mongoose'

const ChildAccount = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String },
  phone: { type: String, required: true },
  dateOfBirth: { type: String },
  loginCode: { type: String },
  isChildUser: { type: Boolean, default: true },
  consultationFeePaid: { type: Boolean, default: true },
  parentAccountId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
},
  { timestamps: true }
)

const ChildAccountSchema = mongoose.model('ChildAccount', ChildAccount)

export default ChildAccountSchema