import User from "../models/User.js"
import Code from "../models/Code.js"
import ChildAccount from "../models/ChildAccount.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";


export const registerUser = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    address,
    city,
    province,
    postalCode,
    accountType,
    paymentMode,
    recurringPayment
  } = req.body.primaryUserData
  try {
    const code = await Code.findOne({ isAssigned: false })

    const newUser = await new User({
      firstName,
      lastName,
      email,
      password: bcrypt.hashSync(req.body.primaryUserData.password, 10),
      phone,
      address,
      city,
      province,
      postalCode,
      accountType,
      paymentMode,
      recurringPayment,
      loginCode: code.code
    });

    code.isAssigned = true
    code.userId = newUser._id
    await code.save()
    const savedUser = await newUser.save()

    // Saving Child Accounts
    req.body.childUsersData && req.body.childUsersData.filter(Boolean).map(async childAccount => {
      const newChildAccount = new ChildAccount({
        ...childAccount,
        password: bcrypt.hashSync(childAccount.password, 10),
        parentAccountId: savedUser._id
      });
      const savedChildAccount = await newChildAccount.save();
      savedUser.childAccounts.push(savedChildAccount._id)
      await savedUser.save()
    })
    await savedUser.save()
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


