# MediTrack - Twilio Configuration

To enable phone number authentication with SMS OTP, you need to provide the following Twilio credentials:

## Required Twilio Information

Please provide these details from your Twilio account:

1. **TWILIO_ACCOUNT_SID** - Your Twilio Account SID
   - Found in your [Twilio Console Dashboard](https://console.twilio.com/)
   
2. **TWILIO_AUTH_TOKEN** - Your Twilio Auth Token
   - Found in your [Twilio Console Dashboard](https://console.twilio.com/)
   
3. **TWILIO_PHONE_NUMBER** - Your Twilio phone number (with country code)
   - Format: `+1234567890`
   - Get a phone number from [Twilio Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming)

## How to Get Twilio Credentials

### Step 1: Create a Twilio Account
1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free trial account
3. Verify your email and phone number

### Step 2: Get Your Account SID and Auth Token
1. Log in to [Twilio Console](https://console.twilio.com/)
2. Your **Account SID** and **Auth Token** are displayed on the dashboard
3. Click the eye icon to reveal the Auth Token

### Step 3: Get a Phone Number
1. In the Twilio Console, go to **Phone Numbers** → **Manage** → **Buy a number**
2. Select your country
3. Choose a phone number with **SMS** capability
4. Purchase the number (free trial includes credit)

### Step 4: Add to .env File

Once you have these credentials, add them to your `.env` file:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3001
SESSION_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:8000
NODE_ENV=development
```

## Testing Without Twilio

If you don't have Twilio configured yet, the OTP will be logged to the backend console. You can still test the application by:

1. Starting the backend server
2. Entering a phone number in the frontend
3. Checking the backend console for the OTP code
4. Entering the OTP to log in

## Twilio Trial Limitations

- Free trial accounts can only send SMS to verified phone numbers
- To verify a phone number: **Twilio Console** → **Phone Numbers** → **Verified Caller IDs**
- Trial accounts have limited credits (~$15 USD)
- Each SMS costs approximately $0.0075

## Production Considerations

For production use:
- Upgrade to a paid Twilio account
- Consider using Twilio Verify API for better OTP management
- Implement rate limiting to prevent SMS abuse
- Add phone number verification before sending OTP
- Monitor SMS usage and costs

---

**Once you provide these credentials, I'll update the `.env` file and the application will be ready to send SMS OTPs!**
