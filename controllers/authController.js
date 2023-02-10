import User from "../models/User.js"
import ChildAccount from "../models/ChildAccount.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";


export const registerUser = async (req, res) => {

  try {
    const newUser = await new User({
      firstName: req.body.primaryUserData.firstName,
      lastName: req.body.primaryUserData.lastName,
      email: req.body.primaryUserData.email,
      password: bcrypt.hashSync(req.body.primaryUserData.password, 10),
      phone: req.body.primaryUserData.phone,
      address: req.body.primaryUserData.address,
      city: req.body.primaryUserData.city,
      province: req.body.primaryUserData.province,
      postalCode: req.body.primaryUserData.postalCode,
    });
    const savedUser = await newUser.save()

    req.body.childUsersData && req.body.childUsersData.filter(Boolean).map(async childAccount => {
      const newChildAccount = new ChildAccount({
        ...childAccount,
        parentAccountId: savedUser._id
      });
      const savedChildAccount = await newChildAccount.save();
      savedUser.childAccounts.push(savedChildAccount._id)
      savedUser.save()
    })

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
    );

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

        const { password, ...others } = user._doc;
        res.status(200).json({ ...others, accessToken });
      }
    })
  } catch (err) {
    res.status(500).json(err);
  }

}


