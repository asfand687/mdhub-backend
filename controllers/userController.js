import User from "../models/User.js";
import DeletedUser from "../models/DeletedUser.js";
import Code from "../models/Code.js";
import ChildAccount from "../models/ChildAccount.js";
import Appointment from "../models/Appointment.js";
import bcrypt from "bcrypt";
import {
  confirmPaymentIntent,
  confirmPaymentIntentForOnDemandUser,
  getPaymentInfo,
  updatePaymentMethod,
} from "../utils/utils.js";
import Stripe from "stripe";
import * as dotenv from "dotenv";
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY);

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("childAccounts");
    if(!user) {
      const childUser = await ChildAccount.findById(req.params.id)
      if(!childUser) {
        return res.status(400).json("No User Found")
      }
      return res.status(200).json(childUser)
    }
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
};

export const makeOnDemandPayment = async (req, res) => {
  const { userId, amount, paymentMethod } = req.body;
  try {
    const user = await User.findById(userId);
    if (user) {
      const customer = await stripe.customers.create({
        description: `Customer for MDHub- ${user.email}`,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        payment_method: paymentMethod,
        invoice_settings: {
          default_payment_method: paymentMethod,
        },
      });
      await stripe.paymentIntents.create({
        amount: amount, // Replace with the amount you want to charge in cents
        currency: "cad", // Replace with your preferred currency,
        payment_method: paymentMethod,
        customer: customer.id,
        setup_future_usage: "on_session",
        confirm: true,
        metadata: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      });
      user.consultationFeePaid = true;
      await user.save();
      const mailOptions = {
        from: "asfandyar687@gmail.com",
        to: user.email,
        subject: "Welcome to MDHUB",
        html: `
        <!doctype html>
        <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
        <title></title>
        <!--[if !mso]><!-->
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <!--<![endif]-->
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style type="text/css">
        #outlook a{padding:0;}body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}table,td{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}img{border:0;height:auto;line-height:100%;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;}p{display:block;margin:0;}
        </style>
        <!--[if mso]> <noscript><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
        <![endif]-->
        <!--[if lte mso 11]>
        <style type="text/css">
        .ogf{width:100% !important;}
        </style>
        <![endif]-->
        <!--[if !mso]><!-->
        <link href="https://fonts.googleapis.com/css?family=Inter:400,300,700" rel="stylesheet" type="text/css">
        <style type="text/css">
        
        </style>
        <!--<![endif]-->
        <style type="text/css">
        @media only screen and (min-width:799px){.pc100{width:100%!important;max-width:100%;}.xc643{width:643px!important;max-width:643px;}}
        </style>
        <style media="screen and (min-width:799px)">.moz-text-html .pc100{width:100%!important;max-width:100%;}.moz-text-html .xc643{width:643px!important;max-width:643px;}
        </style>
        <style type="text/css">
        @media only screen and (max-width:798px){table.fwm{width:100%!important;}td.fwm{width:auto!important;}}
        </style>
        <style type="text/css">
        u+.emailify .gs{background:#000;mix-blend-mode:screen;display:inline-block;padding:0;margin:0;}u+.emailify .gd{background:#000;mix-blend-mode:difference;display:inline-block;padding:0;margin:0;}u+.emailify a,#MessageViewBody a,a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important;}span.MsoHyperlink{mso-style-priority:99;color:inherit;}span.MsoHyperlinkFollowed{mso-style-priority:99;color:inherit;}td.b .klaviyo-image-block{display:inline;vertical-align:middle;}
        @media only screen and (max-width:799px){.emailify{height:100%!important;margin:0!important;padding:0!important;width:100%!important;}u+.emailify .glist{margin-left:1em!important;}td.ico.v>div.il>a.l.m,td.ico.v .mn-label{padding-right:0!important;padding-bottom:16px!important;}td.x{padding-left:0!important;padding-right:0!important;}.fwm img{max-width:100%!important;height:auto!important;}.aw img{width:auto!important;margin-left:auto!important;margin-right:auto!important;}.ah img{height:auto!important;}td.b.nw>table,td.b.nw a{width:auto!important;}td.stk{border:0!important;}td.u{height:auto!important;}br.sb{display:none!important;}.thd-1 .i-thumbnail{display:inline-block!important;height:auto!important;overflow:hidden!important;}.hd-1{display:block!important;height:auto!important;overflow:visible!important;}.ht-1{display:table!important;height:auto!important;overflow:visible!important;}.hr-1{display:table-row!important;height:auto!important;overflow:visible!important;}.hc-1{display:table-cell!important;height:auto!important;overflow:visible!important;}div.r.pr-16>table>tbody>tr>td,div.r.pr-16>div>table>tbody>tr>td{padding-right:16px!important}div.r.pl-16>table>tbody>tr>td,div.r.pl-16>div>table>tbody>tr>td{padding-left:16px!important}}
        </style>
        <meta name="color-scheme" content="light dark">
        <meta name="supported-color-schemes" content="light dark">
        <!--[if gte mso 9]>
        <style>li{text-indent:-1em;}
        </style>
        <![endif]-->
        </head>
        <body lang="en" link="#DD0000" vlink="#DD0000" class="emailify" style="mso-line-height-rule:exactly;word-spacing:normal;background-color:#f5f5f5;"><div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;</div><div class="bg" style="background-color:#f5f5f5;" lang="en">
        <!--[if mso | IE]>
        <table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="none" style="width:800px;" width="800"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;">
        <![endif]--><div class style="margin:0px auto;max-width:800px;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" role="none" style="width:100%;"><tbody><tr><td style="direction:ltr;font-size:0;padding:0;text-align:center;">
        <!--[if mso | IE]>
        <table role="none" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:800px;">
        <![endif]--><div class="pc100 ogf" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
        <table border="0" cellpadding="0" cellspacing="0" role="none" width="100%"><tbody><tr><td style="vertical-align:top;padding:0;">
        <table border="0" cellpadding="0" cellspacing="0" role="none" style width="100%"><tbody><tr><td align="left" class="i  fw-1" style="font-size:0;padding:0;word-break:break-word;">
        <table border="0" cellpadding="0" cellspacing="0" role="none" style="border-collapse:collapse;border-spacing:0;" class="fwm"><tbody><tr><td style="width:800px;" class="fwm"> <a href="https://mdhub.ca/login" target="_blank" title> <img alt src="https://e.hypermatic.com/63126edbcfa7ebb3f18704aee65035ad.jpg" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" title width="800" height="auto"></a>
        </td></tr></tbody></table>
        </td></tr></tbody></table>
        </td></tr></tbody></table></div>
        <!--[if mso | IE]>
        </td></tr></table>
        <![endif]-->
        </td></tr></tbody></table></div>
        <!--[if mso | IE]>
        </td></tr></table>
        <table align="center" border="0" cellpadding="0" cellspacing="0" class="r-outlook -outlook pr-16-outlook pl-16-outlook -outlook" role="none" style="width:800px;" width="800"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;">
        <![endif]--><div class="r  pr-16 pl-16" style="background:#fffffe;background-color:#fffffe;margin:0px auto;max-width:800px;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" role="none" style="background:#fffffe;background-color:#fffffe;width:100%;"><tbody><tr><td style="border:none;direction:ltr;font-size:0;padding:0px 83px 90px 76px;text-align:left;">
        <!--[if mso | IE]>
        <table role="none" border="0" cellpadding="0" cellspacing="0"><tr><td class="c-outlook -outlook -outlook" style="vertical-align:middle;width:643px;">
        <![endif]--><div class="xc643 ogf c" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
        <table border="0" cellpadding="0" cellspacing="0" role="none" width="100%"><tbody><tr><td style="border:none;vertical-align:middle;padding:23px 0px 0px 0px;">
        <table border="0" cellpadding="0" cellspacing="0" role="none" style width="100%"><tbody><tr><td align="left" class="x" style="font-size:0;word-break:break-word;"><div style="text-align:left;"><p style="Margin:0;text-align:left;mso-line-height-alt:150%"><span style="font-size:16px;font-family:Inter,Arial,sans-serif;font-weight:400;color:#777777;line-height:150%;">For additional support email our support team</span><span style="font-size:16px;font-family:Inter,Arial,sans-serif;font-weight:300;color:#777777;line-height:150%;">&nbsp;at</span><span style="font-size:16px;font-family:Inter,Arial,sans-serif;font-weight:700;color:#777777;line-height:150%;text-decoration:underline;"><a href="https://www.google.com/search?q=info%40mdhub.ca&sxsrf=APwXEdeF4iRdSXgjFZQwKHyxNh4xfjWAng%3A1683806329689&ei=edhcZP_fKf64seMP-NGFmA0&ved=0ahUKEwi_gJuxm-3-AhV-XGwGHfhoAdMQ4dUDCA8&uact=5&oq=info%40mdhub.ca&gs_lcp=Cgxnd3Mtd2l6LXNlcnAQA0oECEEYAVAAWABg290caAJwAHgAgAEAiAEAkgEAmAEAwAEB&sclient=gws-wiz-serp" style="color:#777777;text-decoration:underline;" target="_blank">&nbsp;info@mdhub.ca</a></span><span style="font-size:16px;font-family:Inter,Arial,sans-serif;font-weight:400;color:#777777;line-height:150%;">&nbsp;Or access our live chat on&nbsp;</span><span style="font-size:16px;font-family:Inter,Arial,sans-serif;font-weight:400;color:#777777;line-height:150%;text-decoration:underline;"><a href="https://mdhub.ca/" style="color:#777777;text-decoration:underline;" target="_blank">www.mdhub.ca</a></span><span style="font-size:16px;font-family:Inter,Arial,sans-serif;font-weight:400;color:#777777;line-height:150%;">&nbsp;We look forward to being a support for you your family and company! The Care team&nbsp;</span><span style="font-size:16px;font-family:Inter,Arial,sans-serif;font-weight:400;color:#777777;line-height:150%;text-decoration:underline;"><a href="https://mdhub.ca/" style="color:#777777;text-decoration:underline;" target="_blank">@MDHUB.CA</a></span></p></div>
        </td></tr></tbody></table>
        </td></tr></tbody></table></div>
        <!--[if mso | IE]>
        </td></tr></table>
        <![endif]-->
        </td></tr></tbody></table></div>
        <!--[if mso | IE]>
        </td></tr></table>
        <![endif]--></div>
        </body>
        </html>
        `,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
          // do something useful
          res.status(200).json("Email Sent Successfully");
        }
      });
      res.status(200).json(user);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Could Not Complete the payment",
      error: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
 
  try {
    const users = await User.find({}, { password: 0 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
};

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
};

export const getNewUserAndDeletedUserData = async (req, res) => {
  try {
    const usersThisWeek = await User.find({
      createdAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // documents created in the last 7 days
      },
    }).exec();

    const deletedUsers = await DeletedUser.find({}).exec();

    // Get the current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed, so we add 1
    const currentYear = currentDate.getFullYear();

    // Set the start and end of the current month
    const startDate = new Date(currentYear, currentMonth - 1, 1); // Subtract 1 from the month to account for 0-indexing
    const endDate = new Date(currentYear, currentMonth, 0); // Set the end date to the last day of the current month


    const stripeBalance = await stripe.balance.retrieve()
    
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
        totalRevenue: (stripeBalance.available[0].amount / 100).toFixed(2),
        numberOfSubscriptions: subscriptions.data.length,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to retrieve users and deleted users",
      error: error.message,
    });
  }
};

export const getUsersWithLatestPayment = async (req, res) => {
  try {
    const users = await User.find();
    await stripe.balance.retrieve()
    const deletedUsers = await DeletedUser.find({}).exec();
    // const usersWithLatestPayment = await Promise.all(users.map(async user => {
    //   if (user.stripeCustomerId === "test") {
    //     latestPayment = { data: [{ amount: 0, date: new Date() }] }
    //   } else {
    //     latestPayment = await stripe.paymentIntents.list({
    //       customer: user.stripeCustomerId,
    //       limit: 1
    //     })
    //   }
    //   return {
    //     ...user.toJSON(),
    //     latestPayment: {
    //       amount: latestPayment?.data[0]?.amount || null,
    //       date: latestPayment?.data[0]?.created || null
    //     }
    //   }
    // }))
    // const usersWithLatestPayment = await Promise.all(
    //   users.map(async (user) => {
    //     latestPayment = await stripe.paymentIntents.list({
    //       customer: user.stripeCustomerId,
    //       limit: 1,
    //     });
    //     if (latestPayment.data.length === 0) {
    //       return {
    //         ...user.toJSON(),
    //         latestPayment: {
    //           amount: null,
    //           date: null,
    //         },
    //       };
    //     }
      
    //     return {
    //       ...user.toJSON(),
    //       latestPayment: {
    //         amount: latestPayment.data[0].amount || null,
    //         date: latestPayment.data[0].created || null,
    //       },
    //     };
    //   })
    // );
    res.status(200).json({users: users, deletedUsers: deletedUsers});
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to retrieve users",
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    if (req.body.paymentMethod) {
      const attachedPaymentMethod = await updatePaymentMethod(
        req.body.customerId,
        req.body.paymentMethod
      );
      if (attachedPaymentMethod)
        return res.status(200).json("Payment Method Updated");
    }

    const user = await User.findOne({ _id: req.params.id });

    if (req.body.password) {
      user.password = bcrypt.hashSync(req.body.password, 10);
    }
    if (req.body.email) {
      user.email = req.body.email;
    }
    if (req.body.address) {
      user.address = req.body.address;
    }
    if (req.body.phone) {
      user.phone = req.body.phone;
    }

    if (req.body.address) {
      user.address = req.body.address;
    }

    if (req.body.country) {
      user.country = req.body.country;
    }

    if (req.body.region) {
      user.region = req.body.region;
    }

    if (req.body.postalCode) {
      user.postalCode = req.body.postalCode;
    }

    if (req.body.city) {
      user.city = req.body.city
    }

    await user.save();
    res.status(200).json("The User has been updated");
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

export const upgradeToIndividualMonthlyAccount = async (req, res) => {
  
  try {
    const upgradableUser = await User.findById(req.body.userId)
    if(!upgradableUser) {
      return res.status(400).json("User not found")
    }
    const customer = await stripe.customers.retrieve(
      upgradableUser.stripeCustomerId
    );
    

    const prices = await stripe.prices.list({ active: true });
    const existingPrice = prices.data.find(
      (price) => price.nickname === "MdHub Individual Monthly package"
    );
    await confirmPaymentIntentForOnDemandUser(req, customer, upgradableUser);

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: existingPrice.id }],
      default_payment_method:
        customer.invoice_settings.default_payment_method,
    });

    console.log("Subscription Created", subscription)

    upgradableUser.accountType = "individual"
    updateCodeForUser.paymentMethod = "monthly"
    upgradableUser.consultationFeePaid = true
    
    upgradableUser.save()
    res.status(200).json("Account Upgraded")
  } catch (error) {
    res.status(400).json(error.message);
  }
}

export const updateCodeForUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.userId });
    user.loginCode = req.body.codeValue;
    await user.save();
    res.status(200).json("The Code has been updated");
  } catch (error) {
    res.status(400).json(error.message);
  }
};
