import mongoose from 'mongoose'

const ChildAccount = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  isChildUser: { type: Boolean, default: true },
  parentAccountId: { type: String, required: true },
},
  { timestamps: true }
)

const ChildAccountSchema = mongoose.model('ChildAccount', ChildAccount)

export default ChildAccountSchema