import User from "../models/User.js"
import Code from "../models/Code.js"
import ChildAccount from "../models/ChildAccount.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { createStripeCustomer, confirmPaymentIntent, confirmAppointmentPaymentIntent } from "../utils/utils.js"
import Stripe from 'stripe'
import * as dotenv from 'dotenv'
dotenv.config()
const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY)


export const registerUser = async (req, res) => {
  try {
    const { accountType, paymentMode } = req.body.primaryUserData    
    const customer = await createStripeCustomer(req)
    
    const code = await Code.findOne({ isAssigned: false })

    const newUser = new User({
      ...req.body.primaryUserData,
      password: bcrypt.hashSync(req.body.primaryUserData.password, 10),
      stripeCustomerId: customer.id,
      loginCode: code.code
    });
    if(accountType === "on demand") {
      newUser.consultationFeePaid = false
    } else {
      newUser.consultationFeePaid = true
    }
    code.isAssigned = true
    code.userId = newUser._id
    await code.save()
    const savedUser = await newUser.save()

    // Saving Child Accounts
    if (req.body.childUsersData) {
      for (const childAccount of req.body.childUsersData.filter(Boolean)) {
        const newChildAccount = new ChildAccount({
          ...childAccount,
          password: bcrypt.hashSync(childAccount.password, 10),
          parentAccountId: savedUser._id
        });
        const savedChildAccount = await newChildAccount.save();
        savedUser.childAccounts.push(savedChildAccount._id)
      }
      await savedUser.save()
    }

    const { password, ...others } = savedUser._doc;

    if (accountType === "individual" && paymentMode === "monthly") {
      const products = await stripe.products.list({ active: true})
      const existingProduct = products.data.find(product => product.name === "MdHub Individual package")
      if (!existingProduct) {
        // If product doesn't exist, create a new product
        const newProduct = await stripe.products.create({
          active: true,
          name: "MdHub Individual package", 
        });
  
        // Get the newly created product ID
        const productId = newProduct.id;
        console.log('Product created:', newProduct);
  
        // Check if price exists
        const prices = await stripe.prices.list({ active: true });
        const existingPrice = prices.data.find(price => price.nickname === "MdHub Individual Monthly package")
  
        if (existingPrice) {
          // If price exists, use the existing price ID for creating subscription
          await confirmPaymentIntent(req, customer.id)
          // Create subscription with existing price ID
          const subscription = await stripe.subscriptions.create({
            customer: customer.id, 
            items: [{ price: existingPrice.id }],
            trial_period_days: 90,
            default_payment_method: customer.invoice_settings.default_payment_method,
          });
  
          console.log('Subscription created with existing price ID:', subscription);

        } else {
          // If price doesn't exist, create a new price with product ID
          const newPrice = await stripe.prices.create({
            product: productId,
            unit_amount: req.body.totalAmount, 
            currency: 'cad', 
            recurring: { interval: 'month' },
            nickname: 'MdHub Individual Monthly package', 
          });
  
          // Get the newly created price ID
          const newPriceId = newPrice.id;
          
          await confirmPaymentIntent(req, customer.id)
          // Create subscription with newly created price ID
          const subscription = await stripe.subscriptions.create({
            customer: customer.id, 
            items: [{ price: newPriceId }],
            trial_period_days: 90,
            default_payment_method: customer.invoice_settings.default_payment_method,
          });
  
          console.log('Subscription created with newly created price ID:', subscription);
        }
      } else {
        // Check if price exists
        const prices = await stripe.prices.list({ active: true });
        const existingPrice = prices.data.find(price => price.nickname === "MdHub Individual Monthly package")
  
        if (existingPrice) {
          // If price exists, use the existing price ID for creating subscription
  
          await confirmPaymentIntent(req, customer.id)
          // Create subscription with existing price ID
          const subscription = await stripe.subscriptions.create({
            customer: customer.id, 
            items: [{ price: existingPrice.id }],
            trial_period_days: 90,
            default_payment_method: customer.invoice_settings.default_payment_method,
          });
  
          console.log('Subscription created with existing price ID:', subscription);

        } else {
          // If price doesn't exist, create a new price with product ID
          const newPrice = await stripe.prices.create({
            product: existingProduct.id,
            unit_amount: req.body.totalAmount, 
            currency: 'cad', 
            recurring: { interval: 'month' },
            nickname: 'MdHub Individual Monthly package', 
          });
  
          // Get the newly created price ID
          const newPriceId = newPrice.id;
  
          await confirmPaymentIntent(req, customer.id)
          // Create subscription with newly created price ID
          const subscription = await stripe.subscriptions.create({
            customer: customer.id, 
            items: [{ price: newPriceId }],
            trial_period_days: 90,
            default_payment_method: customer.invoice_settings.default_payment_method,
          });
  
          console.log('Subscription created with newly created price ID:', subscription);
        }
      }
    }

    if (accountType === "individual" && paymentMode === "yearly") {
      const products = await stripe.products.list({ active: true})
      const existingProduct = products.data.find(product => product.name === "MdHub Individual package")
      if (!existingProduct) {
        // If product doesn't exist, create a new product
        const newProduct = await stripe.products.create({
          active: true,
          name: "MdHub Individual package", 
        });
  
        // Get the newly created product ID
        const productId = newProduct.id;
        console.log('Product created:', newProduct);
  
        // Check if price exists
        const prices = await stripe.prices.list({ active: true });
        const existingPrice = prices.data.find(price => price.nickname === "MdHub Individual Yearly package")
  
        if (existingPrice) {
          // If price exists, use the existing price ID for creating subscription
  
          // Create subscription with existing price ID
          const subscription = await stripe.subscriptions.create({
            customer: customer.id, 
            coupon: req.body.couponCode,
            items: [{ price: existingPrice.id }],
          });
  
          console.log('Subscription created with existing price ID:', subscription);

        } else {
          // If price doesn't exist, create a new price with product ID
          const newPrice = await stripe.prices.create({
            product: productId,
            unit_amount: req.body.totalAmount, 
            currency: 'cad', 
            recurring: { interval: 'year' },
            nickname: 'MdHub Individual Yearly package', 
          });
  
          // Get the newly created price ID
          const newPriceId = newPrice.id;
  
          // Create subscription with newly created price ID
          const subscription = await stripe.subscriptions.create({
            customer: customer.id, 
            items: [{ price: newPriceId }],
            coupon: req.body.couponCode,
          });
  
          console.log('Subscription created with newly created price ID:', subscription);
        }
      } else {
        // Check if price exists
        const prices = await stripe.prices.list({ active: true });
        const existingPrice = prices.data.find(price => price.nickname === "MdHub Individual Yearly package")
  
        if (existingPrice) {
          // If price exists, use the existing price ID for creating subscription
  
          // Create subscription with existing price ID
          const subscription = await stripe.subscriptions.create({
            customer: customer.id, 
            items: [{ price: existingPrice.id }],
            coupon: req.body.couponCode,
          });
  
          console.log('Subscription created with existing price ID:', subscription);

        } else {
          // If price doesn't exist, create a new price with product ID
          const newPrice = await stripe.prices.create({
            product: existingProduct.id,
            unit_amount: req.body.totalAmount, 
            currency: 'cad', 
            recurring: { interval: 'year' },
            nickname: 'MdHub Individual Yearly package', 
          });
  
          // Get the newly created price ID
          const newPriceId = newPrice.id;
  
          // Create subscription with newly created price ID
          const subscription = await stripe.subscriptions.create({
            customer: customer.id, 
            items: [{ price: newPriceId }],
            coupon: req.body.couponCode,
          });
  
          console.log('Subscription created with newly created price ID:', subscription);
        }
      }
    }

    if (accountType === "family" && paymentMode === "monthly") {
      const products = await stripe.products.list({ active: true})
      const existingProduct = products.data.find(product => product.name === "MdHub Family package")
      if (!existingProduct) {
        // If product doesn't exist, create a new product
        const newProduct = await stripe.products.create({
          active: true,
          name: "MdHub Family package", 
        });
  
        // Get the newly created product ID
        const productId = newProduct.id;
        console.log('Product created:', newProduct);
  
        // Check if price exists
        const prices = await stripe.prices.list({ active: true });
        const existingPrice = prices.data.find(price => price.nickname === `MdHub Family Monthly package for ${req.body.childUsersData.length + 1} members`)
  
        if (existingPrice) {
          // If price exists, use the existing price ID for creating subscription
          await confirmPaymentIntent(req, customer.id)
          // Create subscription with existing price ID
          const subscription = await stripe.subscriptions.create({
            customer: customer.id, 
            items: [{ price: existingPrice.id }],
            trial_period_days: 90,
            default_payment_method: customer.invoice_settings.default_payment_method,
          });
  
          console.log('Subscription created with existing price ID:', subscription);

        } else {
          // If price doesn't exist, create a new price with product ID
          const newPrice = await stripe.prices.create({
            product: productId,
            unit_amount: req.body.totalAmount, 
            currency: 'cad', 
            recurring: { interval: 'month' },
            nickname: `MdHub Family Monthly package for ${req.body.childUsersData.length + 1} members`, 
          });
  
          // Get the newly created price ID
          const newPriceId = newPrice.id;
          
          await confirmPaymentIntent(req, customer.id)
          // Create subscription with newly created price ID
          const subscription = await stripe.subscriptions.create({
            customer: customer.id, 
            items: [{ price: newPriceId }],
            trial_period_days: 90,
            default_payment_method: customer.invoice_settings.default_payment_method,
          });
  
          console.log('Subscription created with newly created price ID:', subscription);
        }
      } else {
        const prices = await stripe.prices.list({ active: true });
        const existingPrice = prices.data.find(price => price.nickname === `MdHub Family Monthly package for ${req.body.childUsersData.length + 1} members`)
  
        if (existingPrice) {
          // If price exists, use the existing price ID for creating subscription
  
          await confirmPaymentIntent(req, customer.id)
          // Create subscription with newly created price ID
          const subscription = await stripe.subscriptions.create({
            customer: customer.id, 
            items: [{ price: newPriceId }],
            trial_period_days: 90,
            default_payment_method: customer.invoice_settings.default_payment_method,
          });
  
          console.log('Subscription created with existing price ID:', subscription);

        } else {
          // If price doesn't exist, create a new price with product ID
          const newPrice = await stripe.prices.create({
            product: existingProduct.id,
            unit_amount: req.body.totalAmount, 
            currency: 'cad', 
            recurring: { interval: 'month' },
            nickname: `MdHub Family Monthly package for ${req.body.childUsersData.length + 1} members`, 
          });
  
          // Get the newly created price ID
          const newPriceId = newPrice.id;
  
          await confirmPaymentIntent(req, customer.id)
          // Create subscription with newly created price ID
          const subscription = await stripe.subscriptions.create({
            customer: customer.id, 
            items: [{ price: newPriceId }],
            trial_period_days: 90,
            default_payment_method: customer.invoice_settings.default_payment_method,
          });
          console.log('Subscription created with newly created price ID:', subscription);
        }
      }
    }

    if (accountType === "family" && paymentMode === "yearly") {
      const products = await stripe.products.list({ active: true})
      const existingProduct = products.data.find(product => product.name === "MdHub Family package")
      if (!existingProduct) {
        // If product doesn't exist, create a new product
        const newProduct = await stripe.products.create({
          active: true,
          name: "MdHub Family package", 
        });
  
        // Get the newly created product ID
        const productId = newProduct.id;
        console.log('Product created:', newProduct);
  
        // Check if price exists
        const prices = await stripe.prices.list({ active: true });
        const existingPrice = prices.data.find(price => price.nickname === `MdHub Family Yearly package for ${req.body.childUsersData.length + 1} members`)
  
        if (existingPrice) {
          // If price exists, use the existing price ID for creating subscription

          // Create subscription with existing price ID
          const subscription = await stripe.subscriptions.create({
            customer: customer.id, 
            items: [{ price: existingPrice.id }],
            coupon: req.body.couponCode,
          });
  
          console.log('Subscription created with existing price ID:', subscription);

        } else {
          // If price doesn't exist, create a new price with product ID
          const newPrice = await stripe.prices.create({
            product: productId,
            unit_amount: parseInt(req.body.totalAmount), 
            currency: 'cad', 
            recurring: { interval: 'year' },
            nickname: `MdHub Family Yearly package for ${req.body.childUsersData.length + 1} members`, 
          });
  
          // Get the newly created price ID
          const newPriceId = newPrice.id;
          
          // Create subscription with newly created price ID
          const subscription = await stripe.subscriptions.create({
            customer: customer.id, 
            items: [{ price: newPriceId }],
            coupon: req.body.couponCode,
          });
  
          console.log('Subscription created with newly created price ID:', subscription);
        }
      } else {
        const prices = await stripe.prices.list({ active: true });
        const existingPrice = prices.data.find(price => price.nickname === `MdHub Family Yearly package for ${req.body.childUsersData.length + 1} members`)
  
        if (existingPrice) {
          // If price exists, use the existing price ID for creating subscription
  
          // Create subscription with newly created price ID
          const subscription = await stripe.subscriptions.create({
            customer: customer.id, 
            items: [{ price: newPriceId }],
          });
  
          console.log('Subscription created with existing price ID:', subscription);

        } else {
          // If price doesn't exist, create a new price with product ID
          const newPrice = await stripe.prices.create({
            product: existingProduct.id,
            unit_amount: parseInt(req.body.totalAmount), 
            currency: 'cad', 
            recurring: { interval: 'year' },
            nickname: `MdHub Family Yearly package for ${req.body.childUsersData.length + 1} members`, 
          });
  
          // Get the newly created price ID
          const newPriceId = newPrice.id;
  
          // Create subscription with newly created price ID
          const subscription = await stripe.subscriptions.create({
            customer: customer.id, 
            items: [{ price: newPriceId }],
            coupon: req.body.couponCode,
          });
          console.log('Subscription created with newly created price ID:', subscription);
        }
      }
    }

    if (accountType === "corporate") {
      const products = await stripe.products.list({ active: true})
      const existingProduct = products.data.find(product => product.name === "MdHub Corporate package")
      if (!existingProduct) {
        // If product doesn't exist, create a new product
        const newProduct = await stripe.products.create({
          active: true,
          name: "MdHub Corporate package", 
        });
  
        // Get the newly created product ID
        const productId = newProduct.id;
        console.log('Product created:', newProduct);
  
        // Check if price exists
        const prices = await stripe.prices.list({ active: true });
        const existingPrice = prices.data.find(price => price.nickname === `MdHub Corporate package for ${req.body.childUsersData.length + 1} members`)
  
        if (existingPrice) {
          // If price exists, use the existing price ID for creating subscription

          // Create subscription with existing price ID
          const subscription = await stripe.subscriptions.create({
            customer: customer.id, 
            items: [{ price: existingPrice.id }],
            coupon: req.body.couponCode,
          });
  
          console.log('Subscription created with existing price ID:', subscription);

        } else {
          // If price doesn't exist, create a new price with product ID
          const newPrice = await stripe.prices.create({
            product: productId,
            unit_amount: parseInt(req.body.totalAmount), 
            currency: 'cad', 
            recurring: { interval: 'year' },
            nickname: `MdHub Corporate package for ${req.body.childUsersData.length + 1} members`, 
          });
  
          // Get the newly created price ID
          const newPriceId = newPrice.id;
          
          // Create subscription with newly created price ID
          const subscription = await stripe.subscriptions.create({
            customer: customer.id, 
            items: [{ price: newPriceId }],
            coupon: req.body.couponCode,
          });
  
          console.log('Subscription created with newly created price ID:', subscription);
        }
      } else {
        const prices = await stripe.prices.list({ active: true });
        const existingPrice = prices.data.find(price => price.nickname === `MdHub Corporate package for ${req.body.childUsersData.length + 1} members`)
  
        if (existingPrice) {
          // If price exists, use the existing price ID for creating subscription
  
          // Create subscription with newly created price ID
          const subscription = await stripe.subscriptions.create({
            customer: customer.id, 
            items: [{ price: newPriceId }],
          });
  
          console.log('Subscription created with existing price ID:', subscription);

        } else {
          // If price doesn't exist, create a new price with product ID
          const newPrice = await stripe.prices.create({
            product: existingProduct.id,
            unit_amount: parseInt(req.body.totalAmount), 
            currency: 'cad', 
            recurring: { interval: 'year' },
            nickname: `MdHub Corporate package for ${req.body.childUsersData.length + 1} members`, 
          });
  
          // Get the newly created price ID
          const newPriceId = newPrice.id;
  
          // Create subscription with newly created price ID
          const subscription = await stripe.subscriptions.create({
            customer: customer.id, 
            items: [{ price: newPriceId }],
            coupon: req.body.couponCode,
          });
          console.log('Subscription created with newly created price ID:', subscription);
        }
      }
    }

    res.status(200).json({ ...others })
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
}


export const loginUser = async (req, res) => {
  try {
    const user = await User.findOne(
      {
        email: req.body.email
      }
    ).populate("childAccounts")

    !user && res.status(401).json("User not found")

    const passwordCorrect = await bcrypt.compare(req.body.password, user.password)
    if (passwordCorrect) {
      const accessToken = jwt.sign(
          {
            id: user._id,
            isChildUser: user.isChildUser,
          isAdmin: user.isAdmin
          },
          process.env.JWT_SEC,
          { expiresIn: "3d" }
      )
      user.lastLoggedIn = new Date()
      await user.save()
      const { password, createdAt, updatedAt, __v, ...others } = user._doc;
      res.status(200).json({ ...others, accessToken })
    } else {
      res.status(401).json("Incorrect Password")
    }
  } catch (err) {
    res.status(500).json(err);
  }

}


