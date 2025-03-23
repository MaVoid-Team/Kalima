const allowedOrigins = require("./allowedOrigins");

const corsOptions = {
  origin: (origin, callback) => {
    try {
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        !origin // No origin accepted in case of using local testing software
      ) {
        callback(null, true);
      } else {
        // return the error message
        callback(new Error("Not allowed by CORS"));
      }
    } catch (err) {
      console.error("CORS validation error:", err);
      callback(new Error("CORS error occurred"));
    }
  },

  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
