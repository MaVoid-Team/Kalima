const { google } = require('googleapis');

// Top-level quick diagnostics so logs appear even if the function isn't invoked during startup
try {
  const topRaw = process.env.GOOGLE_PRIVATE_KEY || '';
  const topHasRaw = !!topRaw && topRaw.length > 0;
  const topHasClientEmail = !!process.env.GOOGLE_CLIENT_EMAIL;
  const topLooksQuoted = /^\s*".*"\s*$/.test(topRaw);

  console.log('Google API env status (init):', {
    GOOGLE_CLIENT_EMAIL_present: topHasClientEmail,
    GOOGLE_PRIVATE_KEY_present: topHasRaw,
    GOOGLE_PRIVATE_KEY_looks_quoted: topLooksQuoted,
    GOOGLE_PRIVATE_KEY_raw_length: topRaw.length,
  });
} catch (err) {
  // Non-fatal — ensure require-time logging never throws
  console.error('Google API env status log failed:', err && err.message ? err.message : err);
}

const configureGoogleSheets = () => {
  try {
    // Robust parsing for GOOGLE_PRIVATE_KEY to support both escaped "\\n" and real newlines,
    // and to tolerate accidental surrounding quotes when pasted into hosting dashboards.
    const rawKey = process.env.GOOGLE_PRIVATE_KEY || '';

    // Remove surrounding quotes if present (safe operation)
    const stripped = rawKey.replace(/^\s*"|"\s*$/g, '');

    const containsEscapedNewlines = stripped.indexOf('\\n') !== -1;
    const containsRealNewlines = stripped.indexOf('\n') !== -1;

    const privateKey = containsEscapedNewlines ? stripped.replace(/\\n/g, '\n') : stripped;

    // Prepare a masked preview (do NOT reveal full key)
    const maskedPreview = (() => {
      if (!privateKey) return null;
      const cleaned = privateKey.replace(/\n/g, '\\n'); // show escaped form
      if (cleaned.length <= 40) return `${cleaned.slice(0, 10)}...${cleaned.slice(-10)}`;
      return `${cleaned.slice(0, 20)}...${cleaned.slice(-20)}`;
    })();

    // Safe debug info (do NOT print the key material itself)
    console.log('Google API config (configureGoogleSheets):', {
      clientEmail: process.env.GOOGLE_CLIENT_EMAIL || null, // client email is not secret
      privateKeyPresent: !!privateKey,
      containsEscapedNewlines,
      containsRealNewlines,
      privateKeyLength: privateKey ? privateKey.length : 0,
      privateKeyPreview: maskedPreview,
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

    // Log auth creation success (this does not call external network)
    console.log('Google API auth client constructed (no network call).');

    // Create and return the Google Sheets API client
    const sheets = google.sheets({ version: 'v4', auth });
    return sheets;
  } catch (error) {
    console.error('Error configuring Google Sheets API client:', error && error.message ? error.message : error);
    throw error;
  }
};

module.exports = { configureGoogleSheets };