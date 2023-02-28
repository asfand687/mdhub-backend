import User from "../models/User.js"
import bcrypt from "bcrypt"
import { getPaymentInfo, updatePaymentMethod } from "../utils/utils.js"

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