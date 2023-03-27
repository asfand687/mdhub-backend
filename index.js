import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import connectDatabase from './mongodb/connect.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/userRoutes.js'
import appointmentRoutes from './routes/appointmentRoutes.js'
import stripeRoutes from './routes/stripeRoutes.js'
import multer from "multer"
import nodemailer from "nodemailer"
import Stripe from "stripe"
import { uploadFile, transporter } from './utils/utils.js'

dotenv.config()

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY)

// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/')
//   },
//   filename: function (req, file, cb) {
//     /*Appending extension with original name*/
//     cb(null, file.originalname)
//   }
// })

// var upload = multer({ storage: storage })

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.GMAIL_EMAIL,
//     pass: process.env.GMAIL_KEY
//   }
// })

const app = express()

// middleware
app.use(express.json({limit: '50mb'}))
app.use(express.urlencoded({extended: true}))
app.use(cors())

// Route Middelwares
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/appointments', appointmentRoutes)
app.use('/api/v1/stripe', stripeRoutes)

app.get('/', async (req, res) => {
  res.send("Hello from MD Hub")
})

app.post("/sendmail", (req, res) => {
  console.log(req.body)
  // const mailOptions = {
  //   from: 'asfandyar687@gmail.com',
  //   to: 'abdul.rafeh118@gmail.com',
  //   subject: 'Requisition Form',
  //   html: `
  //     <div>
  //       <h2>Hello This is Lab Requisition Email for the user ${req.body.firstName}</h2>
  //       <p>Here are the additional details:</p>
  //       <ul>
  //         <li>
  //           Phone: ${req.body.phoneNumber}
  //         </li>
  //         <li>
  //           preferredDate: ${req.body.preferredDate}
  //         </li>
  //         <li>
  //           preferredTime: ${req.body.preferredTime}
  //         </li>
  //         <li>
  //           email: ${req.body.emailAddress}
  //         </li>
  //       </ul>
  //     </div>
  //   `,
  //   attachments: [{
  //     filename: "requisition-form.jpg",
  //     path: req.file.path
  //   }]
  // }

  const mailOptions = {
    from: 'asfandyar687@gmail.com',
    to: 'abdul.rafeh118@gmail.com',
    subject: 'Requisition Form',
    html: `
      <div>
        <h2>Hello This is Lab Requisition Email for the user ${req.body.diagnosticsFormData.firstName}</h2>
        <p>Here are the additional details:</p>
        <ul>
          <li>
            Phone: ${req.body.diagnosticsFormData.phoneNumber}
          </li>
          <li>
            preferredDate: ${req.body.selectedDate}
          </li>
          <li>
            preferredTime: ${req.body.time}
          </li>
          <li>
            email: ${req.body.diagnosticsFormData.emailAddress}
          </li>
          <li>
            address: ${req.body.address}
          </li>
          <li>
            city: ${req.body.city}
          </li>
          <li>
            city: ${req.body.province}
          </li>
          <li>
            Custom Service: ${req.body.customNursingService}
          </li>
        </ul>
      </div>
    `
  }


  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
      // do something useful
      res.status(200).json("Email Sent Successfully")
    }
  })

  res.status(200).json("Email Sent")
})

app.post("/get-billing-info", async (req, res) => {
  try {
    const customer = await stripe.customers.retrieve(req.body.customerId)
    const invoiceList = await stripe.invoices.list({
      customer: customer.id,
      limit: 5,
    })
    const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
      customer: customer.id,
    })
    const subscription = await stripe.subscriptions.retrieve(customer.subscriptions.data[0].id)
    res.status(200).json({ invoiceList, upcomingInvoice, subscription })
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
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