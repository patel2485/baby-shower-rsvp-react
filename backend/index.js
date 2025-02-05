require('dotenv').config();
const nodemailer = require('nodemailer');

// Configure Nodemailer for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,  // Your Gmail address from environment variables
    pass: process.env.GMAIL_PASS,  // Your Gmail app password from environment variables
  },
});

const axios = require('axios');
const fs = require('fs');
const express = require('express');
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['https://avani-baby-shower-rsvp.vercel.app', 'http://localhost:3000'],  // Replace with your actual frontend URL
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(bodyParser.json());

// Google Sheets Setup
const auth = new google.auth.GoogleAuth({
  credentials: require(process.env.GOOGLE_SERVICE_ACCOUNT),  // Path to your Google service account JSON file
  scopes: 'https://www.googleapis.com/auth/spreadsheets'  // Required scope for accessing Google Sheets
});

app.post('/submit-rsvp', async (req, res) => {
  const { isAttending, guestNames, guestCount, email, wishes, nonAttendingName } = req.body;

  try {
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const spreadsheetId = process.env.SPREADSHEET_ID;  // Google Sheets ID from environment variables
    const range = 'Sheet1!A:F';  // Range to append data in Google Sheets

    // Append RSVP data to Google Sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          isAttending ? guestNames[0] : nonAttendingName,  // Full Name
          email,  // Email Address
          isAttending ? guestCount : 0,  // Number of Guests
          isAttending ? guestNames.join(', ') : '',  // Guest Names
          wishes,  // Wishes (Only for admin)
          isAttending ? 'Yes' : 'No'  // Attendance status
        ]],
      },
    });

    // Only send confirmation email if attending
    if (isAttending) {
      const attendeeMailOptions = {
        from: process.env.GMAIL_USER,  // Sender email address
        to: email,  // Recipient's email address
        subject: "🎉 You're Invited! Thank You for Your RSVP! 👶",  // Email subject line
        html: `
          <!-- Main container with background color and padding -->
          <div style="background-color: #fdf4f5; padding: 20px; border-radius: 10px; font-family: Arial, sans-serif; color: #333; text-align: center; width: 60%; margin: auto;">
            <!-- Thank you header -->
            <h2 style="color: #ff4b77; font-size: 24px; margin-bottom: 10px;">Thank You for RSVPing!</h2>
            <p style="font-size: 16px; color: #555; margin-bottom: 20px;">We’re thrilled to celebrate with you!</p>

            <!-- Details box -->
            <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; margin: 10px auto; text-align: left; display: inline-block; width: 90%; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <p style="font-size: 14px; color: #333;">Dear <strong>${guestNames[0]}</strong>,</p>
              <p style="font-size: 14px; color: #555;">Here are the details of your RSVP:</p>
              <ul style="list-style-type: none; padding: 0; font-size: 14px; color: #444;">
                <li>👶 <strong>Attending:</strong> Yes</li>
                <li>👥 <strong>Number of Guests:</strong> ${guestCount}</li>
                <li>🎉 <strong>Guest Names:</strong> ${guestNames.join(', ')}</li>
              </ul>
              <p style="font-size: 14px; color: #555;">We can’t wait to see you at the baby shower!</p>
            </div>

            <!-- Footer with love message -->
            <p style="margin-top: 20px; font-size: 14px; color: #777;">With love,</p>
            <h3 style="color: #ff4b77; font-size: 18px;">Avani & Darshan</h3>
          </div>
        `,
      };

      await transporter.sendMail(attendeeMailOptions);  // Send confirmation email to the attendee
    }

    // Send Updated Spreadsheet PDF to Yourself
    const token = await authClient.getAccessToken();  // Get Google API access token

    const pdfResponse = await axios.get(
      `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=pdf&sheet=RSVP`,
      {
        headers: {
          'Authorization': `Bearer ${token.token}`,  // Authorization header
        },
        responseType: 'arraybuffer',  // Expect binary data for PDF
      }
    );

    const adminMailOptions = {
      from: process.env.GMAIL_USER,  // Sender email address
      to: process.env.GMAIL_USER,  // Send to yourself
      subject: 'New RSVP Submission - PDF Attached',  // Subject line for admin
      text: 'Here is the latest RSVP data in PDF format.',  // Text content
      attachments: [
        {
          filename: 'RSVP_Data.pdf',  // Filename of the attached PDF
          content: pdfResponse.data,  // PDF content
          contentType: 'application/pdf',  // MIME type for PDF
        },
      ],
    };

    await transporter.sendMail(adminMailOptions);  // Send PDF to admin

    res.status(200).send('RSVP submitted successfully!');  // Respond with success
  } catch (error) {
    console.error('Error submitting RSVP:', error);  // Log error to console
    res.status(500).send('Error submitting RSVP');  // Respond with error status
  }
});

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);  // Log server start
// });

// module.exports = app;  // Export the app for Vercel to handle

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
