const nodemailer = require('nodemailer');
const google = require('googleapis');
const { activateEmailTemplate } = require('../emails/activateEmailTemplate');
const { OAuth2Client } = google.Auth;

const OAUTH_PLAYGROUND = `https://developers.google.com/oauthplayground`;

const {
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_REFRESH_TOKEN,
  SENDER_EMAIL_ADDRESS,
} = process.env;

const oauth2Client = new OAuth2Client(
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_REFRESH_TOKEN,
  OAUTH_PLAYGROUND
);

const sendEmail = async (to, url, text, subject) => {
  oauth2Client.setCredentials({
    refresh_token: OAUTH_REFRESH_TOKEN,
  });
  const accessToken = oauth2Client.getAccessToken();
  const smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'oauth2',
      user: SENDER_EMAIL_ADDRESS,
      clientId: OAUTH_CLIENT_ID,
      clientSecret: OAUTH_CLIENT_SECRET,
      refreshToken: OAUTH_REFRESH_TOKEN,
      accessToken,
    },
  });
  const mailOptions = {
    from: SENDER_EMAIL_ADDRESS,
    to,
    subject,
    html: activateEmailTemplate(to, url),
  };

  try {
    const infos = await smtpTransport.sendMail(mailOptions);
    return infos;
  } catch (err) {
    console.log(err);
    return err;
  }
};

// const sendEmail = async (options) => {
//   // 1) Create a transporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });
//   // 2) Define Email Options
//   const mailOptions = {
//     from: 'Mohammad Hadi<hello@mohammad.io>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     // html: TODO
//   };
//   // 3) Actually send the email
//   await transporter.sendMail(mailOptions);
// };

module.exports = sendEmail;
