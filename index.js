import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import connectDatabase from "./mongodb/connect.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/userRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import adminRoutes from './routes/adminRoutes.js'
import stripeRoutes from "./routes/stripeRoutes.js";
import Stripe from "stripe";
import {
  cancelStripeSubscription, createMonthlySubscription,
  pauseAutoPayment,
  setthreeMonthSubscriptionEndDate,
  transporter
} from "./utils/utils.js";
import cron from "node-cron";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY);

// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/')
//   },
//   filename: function (req, file, cb) {
//     /*Appending extension with original name*/
//     cb(null, file.originalname)
//   }
// })

// var upload = multer({ storage: storage })

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.GMAIL_EMAIL,
//     pass: process.env.GMAIL_KEY
//   }
// })

const app = express();

// cronjobs
cron.schedule("59 23 * * *", async function () {
  console.log("---------------------");
  console.log("running a task every day at 23:59");
  // canceling auto collect for 3 months subscribers so stripe will not charge auto for next 3 months
  let today = new Date().toISOString().split('T')[0];
  let users = await User.find({
    createdAt:{
      $gte: today+" 00:00:0+00:00",
      $lt: today+" 23:59:0+00:00"
    },
    paymentMode: "monthly",
    threeMonthSubscriptionEndDate: {$exists: false},
    subscriptionId: {$exists: true}
  });
  console.log("users",users);
  if(users.length>0){
    users.forEach((user)=>{
      pauseAutoPayment(user.subscriptionId);
      setthreeMonthSubscriptionEndDate(user.id);
    });
  } else {
    if(users.subscriptionId){
      pauseAutoPayment(users.subscriptionId);
      setthreeMonthSubscriptionEndDate(users.id);
    }
  }
  // Creating one month subscription for the users whose 3 months subscription is expiring today.
  let users_for_sub = await User.find({
    threeMonthSubscriptionEndDate:{
      $gte: today+" 00:00:0+00:00",
      $lt: today+" 23:59:0+00:00"
    },
  });
  if(users_for_sub.length>0){
    users_for_sub.forEach((user)=>{
      cancelStripeSubscription(user.subscriptionId);
      createMonthlySubscription(user.id);
    });
  } else {
    if(users_for_sub.subscriptionId){
      cancelStripeSubscription(users_for_sub.subscriptionId);
      createMonthlySubscription(users_for_sub.id);
    }
  }
});

// middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Route Middelwares
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/stripe", stripeRoutes);
app.use("/api/v1/admin", adminRoutes)

app.get("/", async (req, res) => {
  res.send("Hello from MD Hub");
});

app.post("/sendmail", (req, res) => {
  // const mailOptions = {
  //   from: "asfandyar687@gmail.com",
  //   to: "abdul.rafeh118@gmail.com",
  //   subject: "Requisition Form",
  //   html: `
  //     <div>
  //       <h2>Hello This is Lab Requisition Email for the user ${req.body.firstName}</h2>
  //       <p>Here are the additional details:</p>
  //       <ul>
  //         <li>
  //           Phone: ${req.body.phoneNumber}
  //         </li>
  //         <li>
  //           preferredDate: ${req.body.preferredDate}
  //         </li>
  //         <li>
  //           preferredTime: ${req.body.preferredTime}
  //         </li>
  //         <li>
  //           email: ${req.body.emailAddress}
  //         </li>
  //       </ul>
  //     </div>
  //   `,
  //   attachments: [
  //     {
  //       filename: "requisition-form.jpg",
  //       path: req.file.path,
  //     },
  //   ],
  // };

  const mailOptions = {
    from: "asfandyar687@gmail.com",
    to: "amir-azimi@hotmail.com",
    subject: "New user Newsletter",
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

  res.status(200).json("Email Sent");
});

app.post("/get-billing-info", async (req, res) => {
  try {
    const customer = await stripe.customers.retrieve(req.body.customerId);
    const invoiceList = await stripe.invoices.list({
      customer: customer.id,
      limit: 5,
    });
    const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
      customer: customer.id,
    });
    const subscription = await stripe.subscriptions.retrieve(
      customer.subscriptions.data[0].id
    );
    res.status(200).json({ invoiceList, upcomingInvoice, subscription });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

app.post("/check_coupon_code", async (req, res) => {
  const { couponCode } = req.body;
  console.log(req.body);
  try {
    const existingCoupon = await stripe.coupons.retrieve(couponCode);
    console.log(existingCoupon);
    if (existingCoupon) {
      console.log(existingCoupon);
      res.status(200).json(existingCoupon);
    } else {
      res.status(400).json("Coupon Not Found");
    }
  } catch (error) {
    if (error.type === "StripeInvalidRequestError") {
      return res.status(400).json("Coupon Not Found");
    } else {
      res.status(400).json(error);
    }
  }
});

const startServer = async () => {
  try {
    connectDatabase(process.env.MONGODB_URI);
    app.listen(8080, () => {
      console.log("Server has started on port: http://localhost:8080");
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();
