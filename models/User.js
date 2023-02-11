import mongoose from 'mongoose'

const User = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique : true },
  password: { type: String, required: true, unique : true },
  phone: { type: String, required: true, unique: true },
  isChildUser: { type: Boolean, default: false },
  address: { type: String },
  city: { type: String },
  province: { type: String },
  postalCode: { type: String },
  childAccounts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ChildAccount' }],
  accountType: { type: String },
  paymentMode: { type: String },
}, 
{ timestamps: true }
)

const UserSchema = mongoose.model('User', User)

export default UserSchema