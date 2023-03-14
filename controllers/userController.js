import User from "../models/User.js"
import DeletedUser from "../models/DeletedUser.js"
import Code from "../models/Code.js"
import ChildAccount from "../models/ChildAccount.js"
import Appointment from "../models/Appointment.js"
import bcrypt from "bcrypt"
import { getPaymentInfo, updatePaymentMethod } from "../utils/utils.js"
import Stripe from 'stripe'
import * as dotenv from 'dotenv'
dotenv.config()
const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY)

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("childAccounts");
    const paymentInfo = user.stripeCustomerId ? await getPaymentInfo(user.stripeCustomerId) : ""
    const userInfo = user._doc;
    res.status(200).json({ paymentInfo, userInfo });
  } catch (error) {
    res.status(500).json(error);
  }
}

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 })
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
}

export const deleteUser = async (req, res) => {
  console.log("DELETE", req.params.id)
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete child accounts associated with the user
    await ChildAccount.deleteMany({ parentAccount: userId });

    // Delete appointments associated with the user
    await Appointment.deleteMany({ user: userId });

    // Add user to DeletedUser model
    const deletedUser = new DeletedUser({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      phone: user.phone,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      address: user.address,
      country: user.country,
      city: user.city,
      region: user.region,
      postalCode: user.postalCode,
      accountType: user.accountType,
      paymentMode: user.paymentMode,
      loginCode: user.loginCode,
      stripeCustomerId: user.stripeCustomerId,
    });

    await deletedUser.save();

    // Remove assigned code and update Code schema
    if (user.loginCode) {
      await Code.findOneAndUpdate(
        { code: user.loginCode },
        { isAssigned: false, userId: null }
      );
    }

    // Delete user from User model
    await User.findByIdAndRemove(userId);

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const getNewUserAndDeletedUserData = async (req, res) => {
  try {
    const usersThisWeek = await User.find({
      createdAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // documents created in the last 7 days
      }
    }).exec();

    const deletedUsers = await DeletedUser.find({}).exec();

    res.status(200).json({
      message: "Successfully retrieved users and deleted users",
      data: { usersThisWeek, deletedUsers }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to retrieve users and deleted users",
      error: error.message
    });
  }
};

export const getUsersWithLatestPayment = async (req, res) => {
  try {
    const users = await User.find()
    const usersWithLatestPayment = await Promise.all(users.map(async user => {
      const latestPayment = await stripe.paymentIntents.list({
        customer: user.stripeCustomerId,
        limit: 1
      })
      return {
        ...user.toJSON(),
        latestPayment: {
          amount: latestPayment.data[0]?.amount || null,
          date: latestPayment.data[0]?.created || null
        }
      }
    }))
    res.status(200).json(usersWithLatestPayment)
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to retrieve users",
      error: error.message
    });
  }
};


export const updateUser = async (req, res) => {
  try {
    if (req.body.paymentMethod) {
      const attachedPaymentMethod = await updatePaymentMethod(req.body.customerId, req.body.paymentMethod)
      if (attachedPaymentMethod)
        return res.status(200).json("Payment Method Updated")
    }

    const user = await User.findOne({ _id: req.params.id })

    if (req.body.password) {
      user.password = bcrypt.hashSync(req.body.password, 10)
    }
    if (req.body.email) {
      user.email = req.body.email
    }
    if (req.body.address) {
      user.address = req.body.address
    }
    if (req.body.phone) {
      user.phone = req.body.phone
    }
    await user.save()
    res.status(200).json("The User has been updated");
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
}