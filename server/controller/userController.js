const nodemailer = require('nodemailer');
const User = require("../model/userDB");
const bcrypt = require('bcrypt');


// SMTP configuration
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

function generateOtpForUser(session) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    session.otp = otp;
    session.otpExpirationTime = Date.now() + 1 * 60 * 1000; // 3 minutes from now

    // Server-side countdown to reset the session variable
    setTimeout(() => {
        session.otpExpirationTime = null;
        session.otp = null;
    }, 1 * 60 * 1000);  // 3 minutes in milliseconds

    return session;
}

async function sendOtpEmail(session, isResend = false) {
    const subject = isResend ? `Your Resend OTP Code [${Date.now()}]` : 'Your OTP Code';
    let mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: session.email,
        subject: subject,
        text: `Your OTP code is: ${session.otp}`
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending OTP email:", error);
        throw error;
    }
}

exports.signUp = (req, res) => {
    res.render('user/signUp')
}

exports.signIn = (req, res) => {
    res.render('user/signIn')
}

exports.myOrders = (req, res) => {
    res.render('user/myOrders')
}

exports.otpPage = async (req, res) => {
    if (!req.session.temp) {
        req.session.temp = {}; // Initialize req.session.temp as an empty object
    }

    if (!req.session.temp.otp || !req.session.temp.otpExpirationTime) {
        generateOtpForUser(req.session.temp);

        try {
            await sendOtpEmail(req.session.temp);
        } catch (error) {
            return res.status(500).send("Error sending OTP email.");
        }
    }

    res.render('user/emailOtp', { countdownExpirationTime: req.session.temp.otpExpirationTime });
};


exports.signup_POST = (req, res) => {
    const fullName = req.body.full_name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    // Store user information in the session
    req.session.temp = {
        fullName,
        email,
        username,
        password
    };

    req.session.save();

    // Redirect to the '/emailOtp' route and render the 'emailOtp' view
    res.redirect('/emailOtp');
}

exports.resend = async (req, res) => {
    generateOtpForUser(req.session.temp);

    try {
        await sendOtpEmail(req.session.temp, true);
    } catch (error) {
        return res.status(500).send(`Error sending OTP email. ${error.message}`);
    }

    return res.status(200).json({
        success: true,
        message: "OTP Sent!",
        otpExpirationTime: req.session.temp.otpExpirationTime
    });
}



exports.verifyOTP = async (req, res) => {
  const userOtp = req.body.otp;

  if (Date.now() > req.session.temp.otpExpirationTime) {
      return res.json({ success: false, message: 'OTP has expired!' });
  }

  if (userOtp === req.session.temp.otp) {
      try {
          const user = new User(req.session.temp);  // No need to manually hash the password

          await user.save();
          req.session.temp = null;  // Clear the temporary session data
          res.json({ success: true, message: 'OTP verified successfully and user saved!' });
      } catch (error) {
          res.status(500).json({ success: false, message: 'There was an error saving the user.' });
      }
  } else {
      res.json({ success: false, message: 'Wrong OTP. Please try again.' });
  }
};





exports.postUser = async (req, res) => {
  try {
      const { fullName, email, phoneNumber, password } = req.body;

      // Create a new user instance
      const user = new User({
          fullName: fullName,
          email: email,
          phoneNumber: phoneNumber,
          password: password  // The password will be hashed automatically due to the schema middleware
      });

      // Save the user in the database
      await user.save();

      // Send a success response
      res.status(201).send({ message: "User created successfully!" });
  } catch (error) {
      // Handle errors (e.g., validation errors, database errors, etc.)
      res.status(500).send({ error: error.message });
  }
};






exports.authenticatePassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Compare the entered password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // Passwords match - user is authenticated
      return res.send('Authentication successful');
    } else {
      // Passwords don't match
      return res.status(401).send('Authentication failed');
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
}