const express = require("express");
const app = express();
const PORT = process.env.PORT || 3200;

app.listen(PORT, () => {
  console.log(`Server active and listening on port ${PORT}`);
});
