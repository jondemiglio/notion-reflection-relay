const express = require('express');
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Load credentials from the .json file
const credentials = JSON.parse(fs.readFileSync('credentials.json'));
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const sheetId = '1bj3TOFImmncSjfN63x4gbxer9K9RGwvxNuUwHXj_KgY'; // your actual sheet ID
const sheetName = 'Reflections'; // make sure this matches your sheet tab name exactly

// Create an authorized Google Sheets API client
const auth = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  SCOPES
);
const sheets = google.sheets({ version: 'v4', auth });

app.post('/reflect', async (req, res) => {
  const { participant, reflection, poi } = req.body;

  if (!participant || !reflection || !poi) {
    return res.status(400).json({ error: 'Missing input' });
  }

  const row = [
    new Date().toISOString(),
    participant,
    reflection,
    poi
  ];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${sheetName}!A:D`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [row],
      },
    });

    res.status(200).json({ success: true, message: 'Reflection added to Google Sheet' });
  } catch (error) {
    console.error('Google Sheets API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to write to Google Sheet' });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Listening for reflections...');
});
