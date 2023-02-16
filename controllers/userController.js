import User from "../models/User.js"
import bcrypt from "bcrypt"

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("childAccounts");
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (error) {
    res.status(500).json(error);
  }
}

export const updateUser = async (req, res) => {
  if (req.body.password) {
    req.body.password = bcrypt.hashSync(req.body.password, 10)
  }
  try {
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