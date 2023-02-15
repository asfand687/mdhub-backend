import mongoose from 'mongoose'

const Code = new mongoose.Schema({
  code: { type: String, required: true },
  isAssigned: { type: Boolean, default: false },
  userId: { type: mongoose.Types.ObjectId, ref: "User" },
},
  { timestamps: true }
)

const CodeSchema = mongoose.model('Code', Code)

export default CodeSchema