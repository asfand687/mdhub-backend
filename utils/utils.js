import jwt from "jsonwebtoken"
import * as dotenv from 'dotenv'
import Stripe from 'stripe'

dotenv.config()
const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY)

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
      payment_method: req.body.paymentMethod
    })
    return customer
  } catch (error) {
    throw new error(`Failed to create customer: ${error}`)
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
    throw new error(`Failed to process payment: ${error}`)
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
    throw new error(`Failed to process payment: ${error}`)
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
