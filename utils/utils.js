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
  var html
  if (req.body.firstName && req.body.lastName && req.body.email) {
    html = `
      <div>
        <h2>New Nursing & Homecare Request</h2>
        <p>Here are the additional details:</p>
        <ul>
          <li>
            Full Name: ${req.body.firstName} ${req.body.lastName}
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
            Postal Code: ${req.body.postalCode}
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
  } else {
    html = `
      <div>
        <h2>New Nursing & Homecare Request</h2>
        <p>Here are the additional details:</p>
        <ul>
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
            Postal Code: ${req.body.postalCode}
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
  return {
    from: 'mdhubtest@gmail.com',
    to: 'amir@cbstudio.ca,safiraja687@gmail.com',
    subject: 'Requisition Form',
    html
  }
}

export const nursingAppointmentMailOptionsWithAttachment = (req) => {
  return {
    from: 'mdhubtest@gmail.com',
    to: 'info@mdhub.ca',
    subject: 'Requisition Form',
    html: `
      <div>
        <h2>New Nursing & Homecare Request</h2>
        <p>Here are the additional details:</p>
        <ul>
          <li>
            Full Name: ${req.body.firstName} ${req.body.lastName}
          </li>
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
            Postal Code: ${req.body.postalCode}
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
    to: 'info@mdhub.ca',
    subject: 'Requisition Form',
    html: `
      <div>
        <h2>New Lab Diagnostics Request</h2>
        <p>Here are the additional details:</p>
        <ul>
          <li>
            Full Name: ${req.body.firstName} ${req.body.lastName}
          </li>
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
            Postal Code: ${req.body.postalCode}
          </li>
          <li>
            Service Type: ${req.body.appointmentType}
          </li>
        </ul>
      </div>
      `
  }
}

export const forgotPasswordMail = (req, user) => {
  return {
    from: 'mdhubtest@gmail.com',
    to: req.body.email,
    subject: 'Forgot Password',
    html: `
      <div>
        <h2>Forgot Password?</h2>
        <p>Click this link to reset your password/p>
        <div>
          <a href="https://mdhub.ca/reset-password/${user._id}">Reset Password Page</a>
        </div>
      </div>
      `
  }
}

export const diagnosticsAppointmentMailOptionsWithAttachment = (req) => {
  return {
    from: 'mdhubtest@gmail.com',
    to: 'info@mdhub.ca',
    subject: 'Requisition Form',
    html: `
      <div>
        <h2>New Lab Diagnostics Request</h2>
        <p>Here are the additional details:</p>
        <ul>
          <li>
            Full Name: ${req.body.firstName} ${req.body.lastName}
          </li>
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
            Postal Code: ${req.body.postalCode}
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
    const customer = await stripe.customers.create({
      description: `Customer for MDHub- ${req.body.primaryUserData.email}`,
      email: req.body.primaryUserData.email,
      name: `${req.body.primaryUserData.firstName} ${req.body.primaryUserData.lastName}`,
      payment_method: req.body.paymentMethod,
      invoice_settings: {
        default_payment_method: req.body.paymentMethod
      }
    })

    // const customer = await stripe.customers.create({
    //   description: "test customer for mdhub family monthly package",
    //   email: email,
    //   name: name,
    //   payment_method: paymentMethod,
    //   invoice_settings: {
    //     default_payment_method: paymentMethod
    //   }
    // })
    console.log('Customer created:', customer.id)
    return customer
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const confirmPaymentIntent = async (req, customerId, onDemandUser) => {
  try {
    if(req.body.totalAmount) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.totalAmount, // Replace with the amount you want to charge in cents
        currency: 'cad', // Replace with your preferred currency,
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
      return true
    } else {
      return
    }
    
  } catch (error) {
    console.log(error)
    throw error(`Failed to process payment: ${error}`)
  }
}

export const confirmPaymentIntentForOnDemandUser = async (req, customer, user) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2999, // Replace with the amount you want to charge in cents
      currency: 'cad', // Replace with your preferred currency,
      payment_method: customer.invoice_settings.default_payment_method,
      customer: customer.id,
      setup_future_usage: "on_session",
      confirm: true,
      metadata: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    })
    return true
  } catch (error) {
    console.log(error)
    throw error(`Failed to process payment: ${error}`)
  }
}

export const confirmAppointmentPaymentIntent = async (req, customerId, paymentMethod, amount) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Replace with the amount you want to charge in cents
      currency: 'cad', // Replace with your preferred currency,
      payment_method: paymentMethod,
      customer: customerId,
      setup_future_usage: "on_session",
      confirm: true,
      metadata: {
        description: `description for MdHub ${req.body.primaryUserData.accountType} ${req.body.primaryUserData.paymentMode} package`
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
