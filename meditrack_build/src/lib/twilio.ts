import Twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  throw new Error('Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN environment variables');
}

export const twilioClient = Twilio(accountSid, authToken);
export const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID!;
