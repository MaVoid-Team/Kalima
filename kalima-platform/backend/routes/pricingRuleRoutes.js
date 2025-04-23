const express = require("express");
const pricingRuleController = require("../controllers/pricingRuleController");
const authController = require("../controllers/authController");
const verifyJWT = require("../middleware/verifyJWT");

const router = express.Router();

// Apply JWT verification to all routes
router.use(verifyJWT);

// Protect routes - Only Admins/SubAdmins can manage pricing rules
router.use(authController.verifyRoles("Admin", "Sub-Admin"));

router
  .route("/")
  .post(pricingRuleController.createPricingRule)
  .get(pricingRuleController.getAllPricingRules);

router
  .route("/:id")
  .get(pricingRuleController.getPricingRuleById)
  .patch(pricingRuleController.updatePricingRule)
  .delete(pricingRuleController.deletePricingRule);

module.exports = router;
