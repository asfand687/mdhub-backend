import jwt from "jsonwebtoken"
import * as dotenv from 'dotenv'
import Stripe from 'stripe'
import multer from "multer"
import nodemailer from "nodemailer"

dotenv.config()
const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY)

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    /*Appending extension with original name*/
    cb(null, file.originalname)
  }
})

export var uploadFile = multer({ storage: storage })

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_KEY
  }
})

export const nursingAppointmentMailOptionsWithoutAttachment = (req) => {
  return {
    from: 'mdhubtest@gmail.com',
    to: 'amir@cbstudio.ca,safiraja687@gmail.com',
    subject: 'Requisition Form',
    html: `
      <div>
        <h2>Hello This is Lab Requisition Email for the user ${req.body.firstName} ${req.body.lastName}</h2>
        <p>Here are the additional details:</p>
        <ul>
          <li>
            Phone: ${req.body.phoneNumber}
          </li>
          <li>
            Email: ${req.body.emailAddress}
          </li>
          <li>
            Date: ${req.body.selectedDate}
          </li>
          <li>
            Time: ${req.body.time}
          </li>
          <li>
            Address: ${req.body.address}
          </li>
          <li>
            City: ${req.body.city}
          </li>
          <li>
            Province: ${req.body.province}
          </li>
          <li>
            Custom Service: ${req.body.customNursingService}
          </li>
          <li>
            Service Type: ${req.body.appointmentType}
          </li>
        </ul>
      </div>
      `
  }
}

export const nursingAppointmentMailOptionsWithAttachment = (req) => {
  return {
    from: 'mdhubtest@gmail.com',
    to: 'amir@cbstudio.ca,safiraja687@gmail.com',
    subject: 'Requisition Form',
    html: `
      <div>
        <h2>Hello This is Lab Requisition Email for the user ${req.body.firstName} ${req.body.lastName}</h2>
        <p>Here are the additional details:</p>
        <ul>
          <li>
            Phone: ${req.body.phoneNumber}
          </li>
          <li>
            Email: ${req.body.emailAddress}
          </li>
          <li>
            Date: ${req.body.selectedDate}
          </li>
          <li>
            Time: ${req.body.time}
          </li>
          <li>
            Address: ${req.body.address}
          </li>
          <li>
            City: ${req.body.city}
          </li>
          <li>
            Province: ${req.body.province}
          </li>
          <li>
            Custom Service: ${req.body.customNursingService}
          </li>
          <li>
            Service Type: ${req.body.appointmentType}
          </li>
        </ul>
      </div>
      `,
    attachments: [{
      filename: "requisition-form.jpg",
      path: req.file.path
    }]
  }
}

export const diagnosticsAppointmentMailOptionsWithoutAttachment = (req) => {
  return {
    from: 'mdhubtest@gmail.com',
    to: 'amir@cbstudio.ca,safiraja687@gmail.com',
    subject: 'Requisition Form',
    html: `
      <div>
        <h2>Hello This is Lab Requisition Email for the user ${req.body.firstName} ${req.body.lastName}</h2>
        <p>Here are the additional details:</p>
        <ul>
          <li>
            Phone: ${req.body.phoneNumber}
          </li>
          <li>
            Email: ${req.body.emailAddress}
          </li>
          <li>
            Date: ${req.body.selectedDate}
          </li>
          <li>
            Time: ${req.body.time}
          </li>
          <li>
            Address: ${req.body.address}
          </li>
          <li>
            City: ${req.body.city}
          </li>
          <li>
            Province: ${req.body.province}
          </li>
          <li>
            Service Type: ${req.body.appointmentType}
          </li>
        </ul>
      </div>
      `
  }
}

export const diagnosticsAppointmentMailOptionsWithAttachment = (req) => {
  return {
    from: 'mdhubtest@gmail.com',
    to: 'amir@cbstudio.ca,safiraja687@gmail.com',
    subject: 'Requisition Form',
    html: `
      <div>
        <h2>Hello This is Lab Requisition Email for the user ${req.body.firstName} ${req.body.lastName}</h2>
        <p>Here are the additional details:</p>
        <ul>
          <li>
            Phone: ${req.body.phoneNumber}
          </li>
          <li>
            Email: ${req.body.emailAddress}
          </li>
          <li>
            Date: ${req.body.selectedDate}
          </li>
          <li>
            Time: ${req.body.time}
          </li>
          <li>
            Address: ${req.body.address}
          </li>
          <li>
            City: ${req.body.city}
          </li>
          <li>
            Province: ${req.body.province}
          </li>
          <li>
            Service Type: ${req.body.appointmentType}
          </li>
        </ul>
      </div>
      `,
    attachments: [{
      filename: "requisition-form.jpg",
      path: req.file.path
    }]
  }
}


export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SEC, (err, user) => {
      if (err) res.status(403).json("Token is not valid!");
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json("You are not authenticated!");
  }
}

export const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("You are not alowed to do that!");
    }
  });
};

export const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("You are not alowed to do that!");
    }
  });
};

export const createStripeCustomer = async (req) => {
  try {
    // const customer = await stripe.customers.create({
    //   description: `Customer for MDHub- ${req.body.primaryUserData.email}`,
    //   email: req.body.primaryUserData.email,
    //   name: `${req.body.primaryUserData.firstName} ${req.body.primaryUserData.lastName}`,
    //   payment_method: req.body.paymentMethod
    // })

    const { email, name } = req.body

    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: '4242424242424242',
        exp_month: 12,
        exp_year: 2030,
        cvc: '123',
      },
    })

    console.log('Payment method created:', paymentMethod.id)

    const customer = await stripe.customers.create({
      description: "test customer for mdhub family monthly package",
      email: email,
      name: name,
      payment_method: paymentMethod,
      invoice_settings: {
        default_payment_method: paymentMethod
      }
    })
    console.log('Customer created:', customer.id)
    return customer
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const confirmPaymentIntent = async (req, customerId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.totalAmount, // Replace with the amount you want to charge in cents
      currency: 'usd', // Replace with your preferred currency,
      payment_method: req.body.paymentMethod,
      customer: customerId,
      setup_future_usage: "on_session",
      confirm: true,
      metadata: {
        firstName: req.body.primaryUserData.firstName,
        lastName: req.body.primaryUserData.lastName,
        email: req.body.primaryUserData.email,
      },
    })
    return paymentIntent
  } catch (error) {
    throw error(`Failed to process payment: ${error}`)
  }
}

export const confirmAppointmentPaymentIntent = async (req, customerId, paymentMethod, amount) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Replace with the amount you want to charge in cents
      currency: 'usd', // Replace with your preferred currency,
      payment_method: paymentMethod,
      customer: customerId,
      setup_future_usage: "on_session",
      confirm: true,
      metadata: {
        description: `description for ${req.body.service}`
      },
    })
    return paymentIntent
  } catch (error) {
    throw error(`Failed to process payment: ${error}`)
  }
}

export const getPaymentInfo = async (customerId) => {
  try {
    const paymentMethod = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card'
    })
    return paymentMethod.data[0].card.last4
  } catch (error) {
    throw new error("Failed to retrieve payment info")
  }
}

export const updatePaymentMethod = async (customerId, paymentMethodId) => {
  try {
    const paymentMethod = await stripe.paymentMethods.attach(
      paymentMethodId,
      { customer: customerId }
    )
    return true
  } catch (error) {
    throw new error("Failed to retrieve payment info")
  }
}
