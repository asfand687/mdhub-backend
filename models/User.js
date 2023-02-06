import mongoose from 'mongoose'

const User = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique : true },
  password: { type: String, required: true, unique : true },
  phone: { type: String, required: true, unique: true}
}, 
{ timestamps: true }
)

const UserSchema = mongoose.model('User', User)

export default UserSchema