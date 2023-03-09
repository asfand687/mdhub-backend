import User from "../models/User.js"
import Code from "../models/Code.js"
import ChildAccount from "../models/ChildAccount.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { createStripeCustomer, confirmPaymentIntent } from "../utils/utils.js"
import Stripe from 'stripe'
import * as dotenv from 'dotenv'
dotenv.config()
const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY)


export const registerUser = async (req, res) => {
  try {
    const customer = await createStripeCustomer(req)
    await confirmPaymentIntent(req, customer.id)

    if (accountType === "family" && paymentMode === "monthly") {
      await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price: 'price_1MjoXKE5iIaQvU2gv27b2F8L',
          },
        ],
        trial_period_days: 90,
        default_payment_method: req.body.paymentMethod,
      })
    }

    if (accountType === "family" && paymentMode === "yearly") {
      await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price: 'price_1MjoXrE5iIaQvU2ghMCN6Beh',
          },
        ]
      })
    }

    if (accountType === "individual" && paymentMode === "monthly") {
      await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price: 'price_1MjoToE5iIaQvU2gRY9Aa2AL',
          },
        ],
        trial_period_days: 90,
        default_payment_method: req.body.paymentMethod,
      })
    }

    if (accountType === "individual" && paymentMode === "yearly") {
      await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price: 'price_1MjoW4E5iIaQvU2guHE3OQIQ',
          },
        ]
      })
    }

    if (accountType === "corporate") {
      await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price: 'price_1Mjoe9E5iIaQvU2gVlw4rCNC',
          },
        ]
      })
    }

    if (accountType === "on demand") {
      await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price: 'price_1MjohWE5iIaQvU2ggcqxNaCd',
          },
        ]
      })
    }

    const code = await Code.findOne({ isAssigned: false })

    const newUser = new User({
      ...req.body.primaryUserData,
      password: bcrypt.hashSync(req.body.primaryUserData.password, 10),
      stripeCustomerId: customer.id,
      loginCode: code.code
    });

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
    res.status(200).json({ ...others })
  } catch (err) {
    res.status(500).json(err);
  }
}


export const loginUser = async (req, res) => {
  try {
    const user = await User.findOne(
      {
        email: req.body.email
      }
    ).populate("childAccounts");


    !user && res.status(401).json("User not found");

    await bcrypt.compare(req.body.password, user.password, function (err, result) {
      if (result) {
        const accessToken = jwt.sign(
          {
            id: user._id,
            isChildUser: user.isChildUser,
          },
          process.env.JWT_SEC,
          { expiresIn: "3d" }
        );
        const { password, createdAt, updatedAt, __v, ...others } = user._doc;
        res.status(200).json({ ...others, accessToken })
      } else {
        res.status(401).json("Incorrect Password");
      }
    })
  } catch (err) {
    res.status(500).json(err);
  }

}


