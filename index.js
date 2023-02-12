import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import connectDatabase from './mongodb/connect.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/userRoutes.js'
import appointmentRoutes from './routes/appointmentRoutes.js'

dotenv.config()

const app = express()

// middleware
app.use(express.json({limit: '50mb'}))
app.use(express.urlencoded({extended: true}))
app.use(cors())

// Route Middelwares
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/appointments', appointmentRoutes)

app.get('/', async (req, res) => {
  res.send("Hello from MD Hub")
})

const startServer = async () => {
  try {
    connectDatabase(process.env.MONGODB_URI)
    app.listen(8080, () => {
      console.log("Server has started on port: http://localhost:8080")
    })
  } catch (error) {
    console.log(error)
  }
}

startServer()