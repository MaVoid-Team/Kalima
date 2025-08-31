const { google } = require('googleapis');

const configureGoogleSheets = () => {
  try {
    // Robust parsing for GOOGLE_PRIVATE_KEY to support both escaped "\\n" and real newlines,
    // and to tolerate accidental surrounding quotes when pasted into hosting dashboards.
    const rawKey = process.env.GOOGLE_PRIVATE_KEY || '';
    const hasRaw = rawKey && rawKey.length > 0;

    // Remove surrounding quotes if present
    const stripped = rawKey.replace(/^\s*"|"\s*$/g, '');

    const containsEscapedNewlines = stripped.indexOf('\\n') !== -1;
    const containsRealNewlines = stripped.indexOf('\n') !== -1;

    const privateKey = containsEscapedNewlines ? stripped.replace(/\\n/g, '\n') : stripped;

    // Safe debug info (do NOT print the key material itself)
    console.log('Google API config:', {
      clientEmailPresent: !!process.env.GOOGLE_CLIENT_EMAIL,
      privateKeyPresent: !!privateKey,
      containsEscapedNewlines,
      containsRealNewlines,
      privateKeyLength: privateKey ? privateKey.length : 0,
      scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    });

    if (!process.env.GOOGLE_CLIENT_EMAIL || !privateKey) {
      throw new Error('Missing GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY in environment');
    }

    // Create a new JWT auth client using parsed private key
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      privateKey,
      ['https://www.googleapis.com/auth/spreadsheets.readonly']
    );

    // Create and return the Google Sheets API client
    const sheets = google.sheets({ version: 'v4', auth });
    return sheets;
  } catch (error) {
    console.error('Error configuring Google Sheets API client:', error && error.message ? error.message : error);
    throw error;
  }
};

module.exports = { configureGoogleSheets };