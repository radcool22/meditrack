# MediTrack - Medical Report Management System

A full-featured web application that allows users to securely upload, store, view, and understand their medical reports with AI-powered explanations.

## Features

- 🔐 **Secure Authentication** - Phone number-based OTP verification via SMS
- 📤 **Report Upload** - Upload PDF or image medical reports
- 📊 **Dashboard** - View all reports with search and filter capabilities
- 📄 **Document Viewer** - View reports directly in the browser
- 🤖 **AI Explanations** - Get simple, non-diagnostic explanations using OpenAI GPT-4
- 💬 **Interactive Chat** - Ask follow-up questions about your reports
- 🔒 **Privacy & Security** - Your data is encrypted and only accessible by you

## Technology Stack

### Backend
- **Node.js** with Express
- **SQLite3** database (better-sqlite3)
- **OpenAI API** (GPT-4) for AI explanations
- **Twilio** for SMS OTP delivery
- **Multer** for file uploads
- **PDF-parse** for text extraction

### Frontend
- **Vanilla JavaScript** (no framework required)
- **HTML5** & **CSS3**
- **Responsive Design** for mobile and desktop

## Prerequisites

Before running MediTrack, you need to install:

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **Twilio Account** - [Sign up here](https://www.twilio.com/try-twilio)

## Setup Instructions

### 1. Install Node.js

If you don't have Node.js installed:

**macOS:**
```bash
# Using Homebrew
brew install node

# Or download from https://nodejs.org/
```

**Verify installation:**
```bash
node --version
npm --version
```

### 2. Configure Environment Variables

Create or update the `.env` file in the root directory:

```env
# OpenAI API Key (required)
OPENAI_API_KEY=your_openai_api_key_here

# Twilio Configuration (required for SMS OTP)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Server Configuration
PORT=3001
SESSION_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:8000

# Node Environment
NODE_ENV=development
```

**Getting Twilio Credentials:**

See [TWILIO_SETUP.md](TWILIO_SETUP.md) for detailed instructions on:
- Creating a Twilio account
- Getting your Account SID and Auth Token
- Purchasing a phone number with SMS capability
- Testing with trial account

**Note:** If Twilio is not configured, OTP codes will be logged to the backend console for testing.

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Start the Backend Server

```bash
cd backend
npm start
```

You should see:
```
🏥 MediTrack API Server
✅ Server running on http://localhost:3001
📊 Database: SQLite3
🤖 AI: OpenAI GPT-4
```

The database will be automatically created at `backend/meditrack.db`.

### 5. Start the Frontend

Open a new terminal window:

```bash
cd frontend

# Start a simple HTTP server
# Option 1: Using Python 3
python3 -m http.server 8000

# Option 2: Using Python 2
python -m SimpleHTTPServer 8000

# Option 3: Using Node.js (if you have http-server installed)
npx http-server -p 8000
```

### 6. Access the Application

Open your browser and navigate to:
```
http://localhost:8000
```

## Usage Guide

### 1. Sign Up / Login

1. Click "Get Started" or "Sign In"
2. Enter your phone number with country code (e.g., +1234567890)
3. Check your phone for the 6-digit OTP code via SMS
4. Enter the code to sign in

**Note:** If Twilio is not configured, the OTP will be printed in the backend console.

### 2. Upload a Report

1. Click "Upload Report" button
2. Select a PDF or image file (max 10MB)
3. Fill in the metadata:
   - **Title** (required)
   - **Category** (optional)
   - **Date** (optional)
   - **Source/Hospital** (optional)
4. Click "Upload"

### 3. View Reports

- Browse all your reports on the dashboard
- Use the search bar to find specific reports
- Filter by category
- Sort by date or title

### 4. Get AI Explanation

1. Click on a report card to view details
2. Click "Get AI Explanation"
3. Wait for the AI to analyze and explain the report
4. Ask follow-up questions in the chat interface

### 5. Delete a Report

1. Open the report detail page
2. Click the "Delete" button
3. Confirm deletion

## Project Structure

```
meditrack/
├── backend/
│   ├── server.js              # Main Express server
│   ├── database.js            # SQLite database setup
│   ├── middleware.js          # Auth & file upload middleware
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── reports.js        # Report management routes
│   │   └── ai.js             # AI explanation routes
│   ├── uploads/              # Uploaded files (created automatically)
│   ├── package.json
│   └── meditrack.db          # SQLite database (created automatically)
│
├── frontend/
│   ├── index.html            # Main HTML file
│   ├── css/
│   │   └── style.css         # All styles
│   └── js/
│       ├── config.js         # API configuration
│       ├── api.js            # API helper functions
│       ├── auth.js           # Authentication logic
│       ├── dashboard.js      # Dashboard functionality
│       ├── report-detail.js  # Report viewing & AI chat
│       ├── upload.js         # File upload logic
│       └── app.js            # Main app initialization
│
├── .env                      # Environment variables
├── .gitignore
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and create session
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Reports
- `GET /api/reports` - List all reports (with search/filter)
- `POST /api/reports/upload` - Upload new report
- `GET /api/reports/:id` - Get report details
- `GET /api/reports/:id/file` - Download report file
- `DELETE /api/reports/:id` - Delete report
- `GET /api/reports/categories` - Get all categories

### AI
- `POST /api/ai/explain` - Generate report explanation
- `POST /api/ai/chat` - Ask follow-up questions

## Security Features

- ✅ Email-based OTP authentication
- ✅ Secure HTTP-only session cookies
- ✅ User data isolation (users can only access their own reports)
- ✅ File type and size validation
- ✅ API keys stored server-side only
- ✅ CORS protection
- ✅ SQL injection protection (parameterized queries)

## Troubleshooting

### Backend won't start
- Make sure Node.js is installed: `node --version`
- Check if port 3001 is available
- Verify `.env` file has `OPENAI_API_KEY`

### SMS OTP not working
- Check Twilio credentials in `.env`
- Verify your Twilio phone number has SMS capability
- For trial accounts, ensure the recipient number is verified in Twilio Console
- Check Twilio Console for error logs
- If Twilio fails, OTP will be logged to the backend console

### Frontend can't connect to backend
- Ensure backend is running on port 3001
- Check browser console for CORS errors
- Verify `FRONTEND_URL` in `.env` matches your frontend URL

### File upload fails
- Check file size (must be < 10MB)
- Verify file type (PDF, JPEG, or PNG only)
- Ensure `backend/uploads/` directory has write permissions

### AI explanation not working
- Verify `OPENAI_API_KEY` is valid
- Check OpenAI API quota/billing
- Ensure report is a PDF (image OCR not yet implemented)

## Development

### Running in Development Mode

Backend with auto-reload:
```bash
cd backend
npm run dev
```

### Database Management

The SQLite database is located at `backend/meditrack.db`.

To view/edit the database, use a tool like:
- [DB Browser for SQLite](https://sqlitebrowser.org/)
- [SQLite Viewer VS Code Extension](https://marketplace.visualstudio.com/items?itemName=alexcvzz.vscode-sqlite)

### Testing Sample Reports

Sample medical reports are available in `sample_data/` directory. Use these to test the application.

## Future Enhancements

- [ ] OCR for image reports (using Tesseract or cloud OCR)
- [ ] Export reports as PDF with AI explanations
- [ ] Multi-language support
- [ ] Report sharing with healthcare providers
- [ ] Mobile app (React Native)
- [ ] Cloud storage integration (AWS S3, Google Cloud Storage)
- [ ] Advanced analytics and health insights
- [ ] Medication tracking
- [ ] Appointment reminders

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, please create an issue in the repository.

---

**⚠️ Important Medical Disclaimer:**

MediTrack is an educational tool designed to help you understand your medical reports. The AI-generated explanations are for informational purposes only and should NOT be used for:
- Medical diagnosis
- Treatment decisions
- Replacing professional medical advice

Always consult with qualified healthcare professionals for medical advice, diagnosis, and treatment.
