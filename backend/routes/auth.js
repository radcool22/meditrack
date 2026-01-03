import express from 'express';
import twilio from 'twilio';
import { userDb, otpDb } from '../database.js';

const router = express.Router();

// Twilio client setup
let twilioClient;
try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && twilioPhoneNumber) {
        twilioClient = twilio(accountSid, authToken);
        console.log('✅ Twilio SMS service configured');
    } else {
        console.warn('⚠️  Twilio not configured. OTP will be logged to console.');
    }
} catch (error) {
    console.warn('⚠️  Twilio initialization failed. OTP will be logged to console.');
}

// Generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Validate phone number format
function validatePhoneNumber(phone) {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Check if it's a valid length (10-15 digits)
    if (cleaned.length < 10 || cleaned.length > 15) {
        return null;
    }

    // Add + prefix if not present
    return cleaned.startsWith('+') ? cleaned : '+' + cleaned;
}

// Send OTP to phone number
router.post('/send-otp', async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        // Validate and format phone number
        const formattedPhone = validatePhoneNumber(phone);
        if (!formattedPhone) {
            return res.status(400).json({ error: 'Invalid phone number format. Please include country code.' });
        }

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

        // Store OTP in database (using phone instead of email)
        otpDb.create(formattedPhone, otp, expiresAt);

        // Send SMS via Twilio
        if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
            try {
                await twilioClient.messages.create({
                    body: `Your MediTrack verification code is: ${otp}\n\nThis code will expire in 10 minutes.`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: formattedPhone
                });
                console.log(`✅ OTP sent to ${formattedPhone}`);
            } catch (twilioError) {
                console.error('Twilio send error:', twilioError);
                console.log(`📱 OTP for ${formattedPhone}: ${otp}`);
            }
        } else {
            // Log OTP to console if Twilio not configured
            console.log(`📱 OTP for ${formattedPhone}: ${otp}`);
        }

        res.json({ message: 'OTP sent successfully', phone: formattedPhone });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// Verify OTP and create session
router.post('/verify-otp', async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ error: 'Phone number and OTP are required' });
        }

        // Format phone number
        const formattedPhone = validatePhoneNumber(phone);
        if (!formattedPhone) {
            return res.status(400).json({ error: 'Invalid phone number format' });
        }

        // Verify OTP
        const isValid = otpDb.verify(formattedPhone, otp);

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid or expired OTP' });
        }

        // Find or create user (using phone instead of email)
        let user = userDb.findByEmail(formattedPhone); // Reusing email column for phone
        if (!user) {
            const userId = userDb.create(formattedPhone);
            user = userDb.findById(userId);
        }

        // Create session
        req.session.userId = user.id;
        req.session.phone = user.email; // email column stores phone

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                phone: user.email
            }
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
});

// Get current user
router.get('/me', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = userDb.findById(req.session.userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json({
        id: user.id,
        phone: user.email // email column stores phone
    });
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to logout' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

export default router;
