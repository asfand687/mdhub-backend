import User from "../models/User.js"
import DeletedUser from "../models/DeletedUser.js"
import Code from "../models/Code.js"
import ChildAccount from "../models/ChildAccount.js"
import Appointment from "../models/Appointment.js"
import bcrypt from "bcrypt"
import { confirmPaymentIntent, getPaymentInfo, updatePaymentMethod } from "../utils/utils.js"
import Stripe from 'stripe'
import * as dotenv from 'dotenv'
dotenv.config()
const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY)

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("childAccounts")
    console.log(user.consultationFeePaid)
    // let paymentInfo = {}
    // if (!user.isAdmin && user.stripeCustomerId !== "test") {
    //   paymentInfo = user.stripeCustomerId ? await getPaymentInfo(user.stripeCustomerId) : ""
    // }
    // console.log(paymentInfo)
    // const userInfo = user;
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
}

export const makeOnDemandPayment = async (req, res) => {
  const {userId, amount, paymentMethod} = req.body
  try {
    const user = await User.findById(userId)
    if(user) {
      const customer = await stripe.customers.create({
        description: `Customer for MDHub- ${req.body.user.email}`,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        payment_method: paymentMethod,
        invoice_settings: {
          default_payment_method: paymentMethod
        }
      })
      await stripe.paymentIntents.create({
        amount: amount, // Replace with the amount you want to charge in cents
        currency: 'cad', // Replace with your preferred currency,
        payment_method: paymentMethod,
        customer: customer.id,
        setup_future_usage: "on_session",
        confirm: true,
        metadata: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      })
      user.consultationFeePaid = true
      await user.save()
      res.status(200).json(user)
  }
  } catch (error) {
    console.log(error)
    res.status(400).json(error)
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
    }).exec()

    const deletedUsers = await DeletedUser.find({}).exec()

    // Get the current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed, so we add 1
    const currentYear = currentDate.getFullYear();

    // Set the start and end of the current month
    const startDate = new Date(currentYear, currentMonth - 1, 1); // Subtract 1 from the month to account for 0-indexing
    const endDate = new Date(currentYear, currentMonth, 0); // Set the end date to the last day of the current month

    // Use Stripe's charges API to retrieve all charges within the current month
    const charges = await stripe.charges.list({
      created: {
        gte: Math.floor(startDate.getTime() / 1000), // Convert to Unix timestamp
        lte: Math.floor(endDate.getTime() / 1000), // Convert to Unix timestamp
      },
    });

    // Calculate the total revenue from the charges
    let totalRevenue = 0;
    for (const charge of charges.data) {
      totalRevenue += charge.amount;
    }

    // Use Stripe's subscriptions API to retrieve all subscriptions created within the current month
    const subscriptions = await stripe.subscriptions.list({
      created: {
        gte: Math.floor(startDate.getTime() / 1000), // Convert to Unix timestamp
        lte: Math.floor(endDate.getTime() / 1000), // Convert to Unix timestamp
      },
    });

    res.status(200).json({
      message: "Successfully retrieved users and deleted users",
      data: {
        usersThisWeek,
        deletedUsers,
        totalRevenue: (totalRevenue / 100).toFixed(2),
        numberOfSubscriptions: subscriptions.data.length
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: "Failed to retrieve users and deleted users",
      error: error.message
    });
  }
};

export const getUsersWithLatestPayment = async (req, res) => {
  try {
    const users = await User.find()
    var latestPayment
    const usersWithLatestPayment = await Promise.all(users.map(async user => {
      if (user.stripeCustomerId === "test") {
        latestPayment = { data: [{ amount: 0, date: new Date() }] }
      } else {
        latestPayment = await stripe.paymentIntents.list({
          customer: user.stripeCustomerId,
          limit: 1
        }) 
      }
      return {
        ...user.toJSON(),
        latestPayment: {
          amount: latestPayment?.data[0]?.amount || null,
          date: latestPayment?.data[0]?.created || null
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

    if (req.body.address) {
      user.address = req.body.address
    }

    if (req.body.country) {
      user.country = req.body.country
    }

    if (req.body.region) {
      user.region = req.body.region
    }

    if (req.body.postalCode) {
      user.postalCode = req.body.postalCode
    }

    await user.save()
    res.status(200).json("The User has been updated");
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
}

export const updateCodeForUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.userId })
    user.loginCode = req.body.codeValue
    await user.save()
    res.status(200).json("The Code has been updated")
  } catch (error) {
    res.status(400).json(error.message)
  }
}