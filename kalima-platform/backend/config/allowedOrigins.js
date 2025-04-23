const allowedOrigins = [
    'capacitor://localhost',    // iOS
    'http://localhost',         // Android HTTP
    'https://localhost',        // Android HTTPS (as seen in your logs)
    'https://kalima-edu.com'  // Your web app domain
    // Add http://localhost:3000 or similar if needed for local web development
];

module.exports = allowedOrigins;