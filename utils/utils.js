import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import Stripe from "stripe";
import multer from "multer";
import nodemailer from "nodemailer";
import path from "path";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY);

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    /*Appending extension with original name*/
    cb(null, file.originalname);
  },
});

export var uploadFile = multer({
  storage: storage,
});

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_KEY,
  },
});

export const nursingAppointmentMailOptionsWithoutAttachment = (req) => {
  var html;
  
  if (req.body.firstName && req.body.lastName && req.body.email) {
    html = `
      <div>
        <h2>New Nursing & Homecare Request</h2>
        <p>Here are the additional details:</p>
        <ul>
          <li>
            Full Name: ${req.body.firstName} ${req.body.lastName}
          </li>
          <li>
            Email: ${req.body.emailAddress}
          </li>
          <li>
            Date: ${req.body.selectedDate}
          </li>
          <li>
            Time: ${req.body.time}
          </li>
          <li>
            Address: ${req.body.address}
          </li>
          <li>
            City: ${req.body.city}
          </li>
          <li>
            Province: ${req.body.province}
          </li>
          <li>
            Postal Code: ${req.body.postalCode}
          </li>
          <li>
            Custom Service: ${req.body.customNursingService}
          </li>
          <li>
            Service Type: ${req.body.appointmentType}
          </li>
          ${
            req.body.selectedServices ? 
            `<li>Selected Services: ${JSON.parse(req.body.selectedServices).toString()}</li>`: 
            ""
          }
        </ul>
      </div>
    `;
  } else {
    html = `
      <div>
        <h2>New Nursing & Homecare Request</h2>
        <p>Here are the additional details:</p>
        <ul>
          <li>
            Date: ${req.body.selectedDate}
          </li>
          <li>
            Time: ${req.body.time}
          </li>
          <li>
            Address: ${req.body.address}
          </li>
          <li>
            City: ${req.body.city}
          </li>
          <li>
            Province: ${req.body.province}
          </li>
          <li>
            Postal Code: ${req.body.postalCode}
          </li>
          <li>
            Custom Service: ${req.body.customNursingService}
          </li>
          <li>
            Service Type: ${req.body.appointmentType}
          </li>
          ${
            req.body.selectedServices ? 
            `<li>Selected Services: ${JSON.parse(req.body.selectedServices).toString()}</li>`: 
            ""
          }
        </ul>
      </div>
    `;
  }
  return {
    from: "mdhubtest@gmail.com",
    to: "amir@cbstudio.ca,safiraja687@gmail.com",
    subject: "Requisition Form",
    html,
  };
};

export const nursingAppointmentMailOptionsWithAttachment = (req) => {
  return {
    from: "mdhubtest@gmail.com",
    to: "info@mdhub.ca",
    subject: "Requisition Form",
    html: `
      <div>
        <h2>New Nursing & Homecare Request</h2>
        <p>Here are the additional details:</p>
        <ul>
          <li>
            Full Name: ${req.body.firstName} ${req.body.lastName}
          </li>
          <li>
            Phone: ${req.body.phoneNumber}
          </li>
          <li>
            Email: ${req.body.emailAddress}
          </li>
          <li>
            Date: ${req.body.selectedDate}
          </li>
          <li>
            Time: ${req.body.time}
          </li>
          <li>
            Address: ${req.body.address}
          </li>
          <li>
            City: ${req.body.city}
          </li>
          <li>
            Province: ${req.body.province}
          </li>
          <li>
            Postal Code: ${req.body.postalCode}
          </li>
          <li>
            Custom Service: ${req.body.customNursingService}
          </li>
          <li>
            Service Type: ${req.body.appointmentType}
          </li>
          ${
            req.body.selectedServices ? 
            `<li>Selected Services: ${JSON.parse(req.body.selectedServices).toString()}</li>`: 
            ""
          }
        </ul>
      </div>
      `,
    attachments: [
      {
        filename: "requisition-form.jpg",
        path: req.file.path,
      },
    ],
  };
};

export const diagnosticsAppointmentMailOptionsWithoutAttachment = (req) => {
  return {
    from: "mdhubtest@gmail.com",
    to: "info@mdhub.ca",
    subject: "Requisition Form",
    html: `
      <div>
        <h2>New Lab Diagnostics Request</h2>
        <p>Here are the additional details:</p>
        <ul>
          <li>
            Full Name: ${req.body.firstName} ${req.body.lastName}
          </li>
          <li>
            Phone: ${req.body.phoneNumber}
          </li>
          <li>
            Email: ${req.body.emailAddress}
          </li>
          <li>
            Date: ${req.body.selectedDate}
          </li>
          <li>
            Time: ${req.body.time}
          </li>
          <li>
            Address: ${req.body.address}
          </li>
          <li>
            City: ${req.body.city}
          </li>
          <li>
            Province: ${req.body.province}
          </li>
          <li>
            Postal Code: ${req.body.postalCode}
          </li>
          <li>
            Service Type: ${req.body.appointmentType}
          </li>
        </ul>
      </div>
      `,
  };
};

export const forgotPasswordMail = (req, user) => {
  return {
    from: "mdhubtest@gmail.com",
    to: req.body.email,
    subject: "Forgot Password",
    html: `
      <div>
        <h2>Forgot Password?</h2>
        <p>Click this link to reset your password/p>
        <div>
          <a href="https://mdhub.ca/reset-password/${user._id}">Reset Password Page</a>
        </div>
      </div>
      `,
  };
};

export const diagnosticsAppointmentMailOptionsWithAttachment = (req) => {
  return {
    from: "mdhubtest@gmail.com",
    to: "info@mdhub.ca",
    subject: "Requisition Form",
    html: `
      <div>
        <h2>New Lab Diagnostics Request</h2>
        <p>Here are the additional details:</p>
        <ul>
          <li>
            Full Name: ${req.body.firstName} ${req.body.lastName}
          </li>
          <li>
            Phone: ${req.body.phoneNumber}
          </li>
          <li>
            Email: ${req.body.emailAddress}
          </li>
          <li>
            Date: ${req.body.selectedDate}
          </li>
          <li>
            Time: ${req.body.time}
          </li>
          <li>
            Address: ${req.body.address}
          </li>
          <li>
            City: ${req.body.city}
          </li>
          <li>
            Province: ${req.body.province}
          </li>
          <li>
            Postal Code: ${req.body.postalCode}
          </li>
          <li>
            Service Type: ${req.body.appointmentType}
          </li>
        </ul>
      </div>
      `,
    attachments: [
      {
        filename: "requisition-form.jpg",
        path: req.file.path,
      },
    ],
  };
};

// new users and child accounts welcome email
export const sendSignupEmail = (email) => {
  const mailOptions = {
    from: "asfandyar687@gmail.com",
    to: email,
    subject: "Welcome to MDHUB",
    html: `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
        <link href="https://fonts.googleapis.com/css2?family=Arimo:wght@400;500;600;700&display=swap" rel="stylesheet">
        <title>MDHUB</title>
      </head>
      <body style="width: 800px; color:black; font-family: Arial, Helvetica, sans-serif; margin:0 auto;">
        <main style="width: 430px; padding:4rem; margin: 0 auto; ">
          <img src="https://i.postimg.cc/28jBQMZ8/image-48.png" alt="logo" style="width: 138px; height:29px; ">
          <h1 style=" font-size: 60px; font-weight: 500;color:black;max-width:611px;">
            Fall in love with your new doctor’s office
          </h1>
          <div style=" font-size: 1rem; font-weight: 500 ; font-family: Arial, Helvetica, sans-serif;margin-top: 1rem;">
            <p>Welcome to Canada’s first online medical platform.</p>
            <p>
              To use your multiple MDHUB benefits simply visit <a href="www.mdhub.ca" style="text-decoration: none; color: black;">www.mdhub.ca</a> and
              click on sign on. Once logged into your dashboard you can navigate any
              of your services.
            </p>
            <p>Its that easy to Never wait for a Doctor again.</p>
          </div>
    
          <a href="https://mdhub.ca/login
          " style="text-decoration: none; color: black;">
            <img src="https://i.postimg.cc/wTcYp4fJ/button.png" alt="" style="
                width: 196px;
                margin-top: 0.5rem;
                cursor: pointer;
              "></a>
          <!-- big image -->
          <img src="https://i.postimg.cc/MKXV7qdR/highres-transformed.jpg" alt="big_image" style="width: 100%; margin-top: 1rem; background-position: center; background-size: cover;">
          <!-- hr -->
          <img src="https://i.postimg.cc/T3LjbFz5/pnnafterimage.png" alt="" style="max-width: 100%; height: 0.1vmax">
          <h3 style="font-size: 24px; font-weight: 700; ">
            Here are 6 reasons why people love MDHUB:
          </h3>
          <!-- 6 reasons -->
            <div style="display: flex; gap: 1.5rem; align-items: center; margin-top: 1rem;">
              <img src="https://i.postimg.cc/SRnR5F7W/layer1.png" alt="first" style="width: 1rem;margin-left:0.3rem;">
              <p style="
                  
                  font-size: 0.7rem;
                  font-weight: 500;
                  margin-left:1.8rem;
                 
                ">
                24/7 on-demand care
              </p>
              </div>
        
            <div style="display: flex; gap: 1.2rem; align-items: center; margin-top: 1rem;">
              <img src="https://i.postimg.cc/jSbNW24m/layer2.png " alt="2nd" style="width: 2rem; margin-left:-.8rem;">
              <p style="
               font-size: 0.7rem;
                  font-weight: 500;
                  margin-left:1rem;

                ">
                A trusted source for COVID-19 care, advice, and testing
              </p>
            </div>
            <div style="display: flex; gap: 1.1rem; align-items: center; margin-top: 1rem;">
              <img src="https://i.postimg.cc/2jWV4myD/layer3.png" alt="3rd" style="width:2rem; margin-left: -0.7rem;">
              <p style="
         font-size: 0.7rem;
                  font-weight: 500;
                  margin-left:1.1rem;

                ">
                Easy prescription requests and fast delivery
              </p>
            </div>
            <div style="display: flex;  gap: 1rem; align-items: center; margin-top: 1rem;">
              <img src="https://i.postimg.cc/vTyMrJ2Y/layer4.png" alt="first" style="width: 2rem; margin-left: -0.7rem;">
              <p style="
                   font-size: 0.7rem;
                  font-weight: 500;
                  margin-left:1rem;

                ">
                Easy access to appointments with specialists
              </p>
            </div>
            <div style="display: flex; gap: 1.2rem; align-items: center;margin-top: 1rem; ">
              <img src="https://i.postimg.cc/L8wcBdhc/layer5.png" alt="first" style="width: 1.8rem; margin-left: -0.6rem;">
              <p style="
              font-size: 0.7rem;;
                  font-weight: 500;
                  margin-left:1.2rem;

            
                ">
                Drop-in or mobile affordable lab services
              </p>
            </div>
            <div style="display: flex;gap: 1.1rem; align-items: center; margin-top: 1rem; ">
              <img src="https://i.postimg.cc/TPvk3TK3/layer6.png" alt="first" style="width: 2rem; margin-left: -0.7rem;">
              <p style="
                   font-size: 0.7rem;
                  font-weight: 500;
                  margin-left:1.1rem;

                ">
                Mobile nurses and homecare workers that come to you
              </p>
            </div>
          
          <!-- footer -->
          <div style="width: 100%; padding: 5rem 0; font-family: Arial, Helvetica, sans-serif; color: black;">
            <p style="font-size: 16px;line-height: 1.2rem;">
              For additional support email our support team at
              <a href="info@mdhub.ca" style="text-decoration: none; color: black; font-weight: 800;">info@mdhub.ca</a> Or
              access our live chat on
              <a href="https://www.google.com/search?q=www.mdhub.ca&sxsrf=APwXEddA70737pHBsAKSOQcBT_SyAv6o_g%3A1684518281604&ei=ibVnZNXIJJvj4-EPt_yZiAI&ved=0ahUKEwiVsavO94H_AhWb8TgGHTd-BiEQ4dUDCA8&uact=5&oq=www.mdhub.ca&gs_lcp=Cgxnd3Mtd2l6LXNlcnAQA0oECEEYAFAAWABg2RdoAHAAeACAAXaIAXaSAQMwLjGYAQCgAQKgAQHAAQE&sclient=gws-wiz-serp" style="text-decoration: none; color: black; font-weight: 800;">www.mdhub.ca</a>
            </p>
            <p style="margin-top: 2rem; font-size: 16px;">
              We look forward to being a support for you your family and company!
            </p>
            <p style="margin-top:2rem; padding-bottom: 5rem; font-family: Arial, Helvetica, sans-serif; font-size: 16px;">
              The Care team
              <a href="https://mdhub.ca/" style="text-decoration: none; color: black; font-weight: 800; font-size: 20px;">@MDHUB.CA</a>
            </p>
          </div>
        </main>
      </body>
    </html>
    `,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SEC, (err, user) => {
      if (err) res.status(403).json("Token is not valid!");
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json("You are not authenticated!");
  }
};

export const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("You are not alowed to do that!");
    }
  });
};

export const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("You are not alowed to do that!");
    }
  });
};

export const createStripeCustomer = async (req) => {
  try {
    const customer = await stripe.customers.create({
      description: `Customer for MDHub- ${req.body.primaryUserData.email}`,
      email: req.body.primaryUserData.email,
      name: `${req.body.primaryUserData.firstName} ${req.body.primaryUserData.lastName}`,
      payment_method: req.body.paymentMethod,
      invoice_settings: {
        default_payment_method: req.body.paymentMethod,
      },
    });

    // const customer = await stripe.customers.create({
    //   description: "test customer for mdhub family monthly package",
    //   email: email,
    //   name: name,
    //   payment_method: paymentMethod,
    //   invoice_settings: {
    //     default_payment_method: paymentMethod
    //   }
    // })
    console.log("Customer created:", customer.id);
    return customer;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const confirmPaymentIntent = async (req, customerId, onDemandUser) => {
  try {
    if (req.body.totalAmount) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.totalAmount, // Replace with the amount you want to charge in cents
        currency: "cad", // Replace with your preferred currency,
        payment_method: req.body.paymentMethod,
        customer: customerId,
        setup_future_usage: "on_session",
        confirm: true,
        metadata: {
          firstName: req.body.primaryUserData.firstName,
          lastName: req.body.primaryUserData.lastName,
          email: req.body.primaryUserData.email,
        },
      });
      return true;
    } else {
      return;
    }
  } catch (error) {
    console.log(error)
    throw error(`Failed to process payment: ${error}`)
  }
}

export const confirmPaymentIntentForOnDemandUser = async (req, customer, user) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.totalAmount * 100, // Replace with the amount you want to charge in cents
      currency: 'cad', // Replace with your preferred currency,
      payment_method: customer.invoice_settings.default_payment_method,
      customer: customer.id,
      setup_future_usage: "on_session",
      confirm: true,
      metadata: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    })
    return true
  } catch (error) {
    console.log(error)
    throw error(`Failed to process payment: ${error}`)
  }
};

export const confirmAppointmentPaymentIntent = async (
  req,
  customerId,
  paymentMethod,
  amount
) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Replace with the amount you want to charge in cents
      currency: "cad", // Replace with your preferred currency,
      payment_method: paymentMethod,
      customer: customerId,
      setup_future_usage: "on_session",
      confirm: true,
    });
    return paymentIntent;
  } catch (error) {
    console.log(error);
  }
};

export const getPaymentInfo = async (customerId) => {
  try {
    const paymentMethod = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });
    return paymentMethod.data[0].card.last4;
  } catch (error) {
    throw new error("Failed to retrieve payment info");
  }
};

export const updatePaymentMethod = async (customerId, paymentMethodId) => {
  try {
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    return true;
  } catch (error) {
    throw new error("Failed to retrieve payment info");
  }
};
