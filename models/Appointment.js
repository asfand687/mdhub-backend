import mongoose from 'mongoose'

const Appointment = new mongoose.Schema({
  serviceName: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  address: { type: String, required: true },
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
},
  { timestamps: true }
)

const AppointmentSchema = mongoose.model('Appointment', Appointment)

export default AppointmentSchema