exports.mailchimpHandler = (email) => {
  const {
    env: { MAILCHIMP_API_KEY, MAILCHIMP_API_ID },
  } = process;

  const DATACENTER = MAILCHIMP_API_KEY.split('-')[1];
  const url = `https://${DATACENTER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_API_ID}/members`;
  const data = {
    email_address: email,
    status: 'subscribed',
  };
  const based64Key = Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString(
    'base64'
  );
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Basic ${based64Key}`,
  };
  return { url, data, headers };
};
