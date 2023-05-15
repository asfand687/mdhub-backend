import User from "../models/User.js";
import Code from "../models/Code.js";
import ChildAccount from "../models/ChildAccount.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import {
  createStripeCustomer,
  confirmPaymentIntent,
  confirmAppointmentPaymentIntent,
  transporter,
  forgotPasswordMail,
} from "../utils/utils.js";
import Stripe from "stripe";
import * as dotenv from "dotenv";
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY);

export const registerCorporateUser = async (req, res) => {
  
  try {
    const newUser = new User({...req.body, password: bcrypt.hashSync(req.body.password, 10)})
    const savedUser = await newUser.save()
    const { password, ...others } = savedUser._doc;
    res.status(200).json({...others})
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}

export const addChildAccount = async (req, res) => {
  try {
    const parentUser = await User.findById(req.body.parentAccountId)
    const newChildAccount = new ChildAccount({
      ...req.body,
      password: bcrypt.hashSync(req.body.password, 10)
    })
    const savedChildAccount = await newChildAccount.save()
    parentUser.childAccounts.push(savedChildAccount._id)
    await parentUser.save()

    res.status(200).json("Child Account Successfully Added")
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}