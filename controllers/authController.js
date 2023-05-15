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
    const { accountType, paymentMode,email } = req.body.primaryUserData    
    const customer = await createStripeCustomer(req)

    if (accountType === "individual" && paymentMode === "monthly") {
      await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price: 'price_1MsuWeHO2OahTS06f0R7LIUC',
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
            price: 'price_1MsuY1HO2OahTS06PEoz5Dq2',
          },
        ],
        default_payment_method: req.body.paymentMethod,
      })
    }

    if (accountType === "family" && paymentMode === "monthly") {
      await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price: 'price_1MlB7vHO2OahTS06f5GQgKEH',
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
            price: 'price_1MlBIdHO2OahTS06H9mP6k8S',
          },
        ],
        default_payment_method: req.body.paymentMethod,
      })
    }

    if (accountType === "on demand") {
      await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price: 'price_1MkkY2HO2OahTS06MFms2Hkr',
          },
        ],
        trial_period_days: 90,
        default_payment_method: req.body.paymentMethod,
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

    const mailOptions = {
      from: "asfandyar687@gmail.com",
      to: email,
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
    ).populate("childAccounts")

    !user && res.status(401).json("User not found")

    const passwordCorrect = await bcrypt.compare(req.body.password, user.password)
    if (passwordCorrect) {
      const accessToken = jwt.sign(
          {
            id: user._id,
            isChildUser: user.isChildUser,
          isAdmin: user.isAdmin
          },
          process.env.JWT_SEC,
          { expiresIn: "3d" }
      )
      user.lastLoggedIn = new Date()
      await user.save()
      const { password, createdAt, updatedAt, __v, ...others } = user._doc;
      res.status(200).json({ ...others, accessToken })
    } else {
      res.status(401).json("Incorrect Password")
    }
  } catch (err) {
    res.status(500).json(err);
  }

}


