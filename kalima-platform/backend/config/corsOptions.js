const allowedOrigins = require("./allowedOrigins");

function checkOrigin(origin) {
  // If origin is provided and it's not in allowedOrigins,
  // the expression on the left of the OR operator is false,
  // causing the immediately invoked function expression (IIFE)
  // to execute and throw an error.
  (allowedOrigins.indexOf(origin) !== -1 || !origin) ||
    (() => { throw new Error("Not allowed by CORS"); })();
}

const corsOptions = {
  origin: (origin, callback) => {
    try {
      checkOrigin(origin);
      callback(null, true);
    } catch (err) {
      console.error("CORS validation error:", err);
      callback(err);
    }
  },

  credentials: true,
  optionSuccessStatus: 200,
};

module.exports = corsOptions;