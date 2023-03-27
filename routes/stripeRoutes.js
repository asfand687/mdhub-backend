import express from 'express'
import { createPrice, createProduct, getPrices, createSubscription, createSubscriptionsForNewUser } from '../controllers/stripeController.js'
const router = express.Router()

// Create Pricing
router.route('/create-price').post(createPrice)

// Get Prices
router.route('/').get(getPrices)

// Create Product
router.route('/create-product').post(createProduct)

// Create Subscription
router.route('/create-subscription').post(createSubscription)

// Create Payment Method
router.route('/create_subscription_for_new_user').post(createSubscriptionsForNewUser)


export default router