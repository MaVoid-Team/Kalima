const fs = require("fs");
const path = require("path");

module.exports = function loadRoutes(app) {
  const routesPath = __dirname;

  fs.readdirSync(routesPath).forEach((file) => {
    if (file === "index.js") return;

    const route = require(path.join(routesPath, file));

    if (typeof route === "function") {
      route(app);
    } else {
      app.use(route);
    }
  });
};