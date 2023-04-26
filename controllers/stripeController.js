import Stripe from 'stripe'
import * as dotenv from 'dotenv'
dotenv.config()
const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY)
import { createStripeCustomer } from '../utils/utils.js'

export const createPrice = async (req, res) => {
  const { product, metadataPriceName, nickname, unit_amount } = req.body
  try {
    const price = await stripe.prices.create({
      active: true,
      currency: "usd",
      product,
      metadata: {
        name: metadataPriceName
      },
      nickname,
      unit_amount,
      recurring: {
        usage_type: "metered",
        interval: "month"
      }
    })
    res.status(200).json(price)
  } catch (error) {
    res.status(400).json(error.message)
  }
}

export const createProduct = async (req, res) => {
  const { name, description, metadataName } = req.body
  try {
    const product = await stripe.products.create({
      active: true,
      name,
      description,
      metadata: {
        name: metadataName
      },
    })
    res.status(200).json(product)
  } catch (error) {
    res.status(400).json(error.message)
  }
}

export const getPrices = async (req, res) => {
  try {
    const prices = await stripe.prices.list({})
    const price = prices.data.find(price => price.nickname === "mdhub test price")
    if (price) {
      // save the id to a variable
      console.log("yes the price exists")
    } else {
      // create new price and save the id to the variable
    }
    // the price id will be used to create the subscription with customer id and other functionalities that I will provide
    res.status(200).json(price)
  } catch (error) {
    res.status(400).json(error.message)
  }
}



export const createSubscription = async (req, res) => {
  const { price, quantity } = req.body
  try {
    const customer = await createStripeCustomer(req)
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price,
          quantity
        },
      ],
      default_payment_method: customer.invoice_settings.default_payment_method,
    })
    res.status(200).json(subscription)
  } catch (error) {
    res.status(400).json(error.message)
  }
}

export const createSubscriptionsForNewUser = async (req, res) => {
  const { email, name, price, quantity, amount } = req.body
  try {
    // this comes from frontend
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: '5555555555554444',
        exp_month: 12,
        exp_year: 2030,
        cvc: '225',
      },
    })
    

    // create a new customer based on information provided in the body
    const customer = await stripe.customers.create({
      description: "test customer for mdhub family monthly package",
      email: email,
      name: name,
      payment_method: paymentMethod.id,
      invoice_settings: {
        default_payment_method: paymentMethod.id
      }
    })

    console.log("Customer created: ", customer.id)

    // If package is familyMonthly or individual monthly
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Replace with the amount you want to charge in cents
      currency: 'usd', // Replace with your preferred currency,
      payment_method: paymentMethod.id,
      customer: customer.id,
      setup_future_usage: "on_session",
      confirm: true,
    })

    console.log("payment intent created: ", paymentIntent.id)

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price,
          quantity
        },
      ],
      trial_period_days: 90,
      default_payment_method: customer.invoice_settings.default_payment_method,
    })

    res.status(200).json(subscription)
  } catch (error) {
    console.log(error)
    res.status(400).json(error)
  }
}