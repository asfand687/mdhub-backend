import User from "../models/User.js"
import bcrypt from "bcrypt"
import { getPaymentInfo, updatePaymentMethod } from "../utils/utils.js"

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("childAccounts");
    const paymentInfo = user.stripeCustomerId ? await getPaymentInfo(user.stripeCustomerId) : ""
    const { password, ...others } = user._doc;
    res.status(200).json({ paymentInfo, ...others });
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
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
}