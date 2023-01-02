const nodemailer = require('nodemailer');
const google = require('googleapis');
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

const sendEmail = async (to, text, subject, html) => {
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
    html,
  };

  try {
    const infos = await smtpTransport.sendMail(mailOptions);
    return infos;
  } catch (err) {
    console.log(err);
    return err;
  }
};

module.exports = sendEmail;
