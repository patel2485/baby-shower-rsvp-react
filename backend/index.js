require('dotenv').config();
const nodemailer = require('nodemailer');
const axios = require('axios');
const express = require('express');
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Configure CORS - Ensure backend allows only trusted origins
app.use(cors({
  origin: ['https://avani-baby-shower-rsvp.vercel.app', 'http://localhost:3000'], 
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(bodyParser.json());

// ✅ Configure Nodemailer for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,  // Your Gmail account
    pass: process.env.GMAIL_PASS,  // App password
  },
});

// ✅ Google Sheets Authentication - Read credentials from JSON file
const serviceAccountPath = path.join(__dirname, 'JSON/electric-loader-449921-h4-b36ef935b276.json');  // Ensure this path matches your file location
let serviceAccount;
try {
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
} catch (error) {
  console.error("❌ Error reading Google Service Account JSON:", error);
}

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: 'https://www.googleapis.com/auth/spreadsheets',
});

// ✅ Route: Submit RSVP
app.post('/submit-rsvp', async (req, res) => {
  const { isAttending, guestNames, guestCount, email, wishes, nonAttendingName } = req.body;

  try {
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const spreadsheetId = process.env.SPREADSHEET_ID; // Google Sheets ID
    const range = 'Sheet1!A:F';

    // ✅ Append RSVP Data to Google Sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          isAttending ? guestNames[0] : nonAttendingName,
          email,
          isAttending ? guestCount : 0,
          isAttending ? guestNames.join(', ') : '',
          wishes,
          isAttending ? 'Yes' : 'No'
        ]],
      },
    });

    // ✅ Send Confirmation Email if Attending
    if (isAttending) {
      const attendeeMailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: "🎉 You're Invited! Thank You for Your RSVP! 👶",
        html: `<div style="background-color: #fdf4f5; padding: 20px; border-radius: 10px; font-family: Arial, sans-serif;">
                <h2 style="color: #ff4b77;">Thank You for RSVPing!</h2>
                <p>We’re thrilled to celebrate with you!</p>
                <p><strong>Attending:</strong> Yes</p>
                <p><strong>Guests:</strong> ${guestCount}</p>
                <p><strong>Names:</strong> ${guestNames.join(', ')}</p>
                <p>See you soon!</p>
                <h3 style="color: #ff4b77;">Avani & Darshan</h3>
              </div>`,
      };
      await transporter.sendMail(attendeeMailOptions);
    }

    // ✅ Send Updated Spreadsheet PDF to Admin
    const token = await authClient.getAccessToken();
    const pdfResponse = await axios.get(
      `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=pdf&sheet=RSVP`,
      { headers: { 'Authorization': `Bearer ${token.token}` }, responseType: 'arraybuffer' }
    );

    const adminMailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, 
      subject: 'New RSVP Submission - PDF Attached',
      text: 'Here is the latest RSVP data in PDF format.',
      attachments: [{ filename: 'RSVP_Data.pdf', content: pdfResponse.data, contentType: 'application/pdf' }]
    };
    await transporter.sendMail(adminMailOptions);

    res.status(200).send('RSVP submitted successfully!');
  } catch (error) {
    console.error('❌ Error submitting RSVP:', error);
    res.status(500).send({ error: 'Error submitting RSVP', details: error.message });
  }
});

// Test Route to Check API Availability
app.get('/api/test', (req, res) => {
  res.status(200).json({ message: "✅ API is working correctly!" });
});

// ✅ Export App for Vercel
module.exports = app;

// ✅ Start Server in Local Development
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}
