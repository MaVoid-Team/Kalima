const ECCartPurchase = require("../../../models/ec.cartPurchaseModel");
const { getCurrentEgyptTime } = require("../helpers");

const buildUserSerial = (user) =>
  user.userSerial || user._id.toString().slice(-8).toUpperCase();

const generatePurchaseSerial = async (userSerial) => {
  const date = getCurrentEgyptTime();
  const formattedDate = date.toFormat("yyyyMMdd");
  const lastPurchase = await ECCartPurchase.findOne({
    purchaseSerial: new RegExp(`${userSerial}-CP-${formattedDate}-\\d+$`),
  }).sort({ purchaseSerial: -1 });

  let sequence = 1;
  if (lastPurchase) {
    const lastSequence = parseInt(
      lastPurchase.purchaseSerial.split("-").pop(),
      10,
    );
    if (!Number.isNaN(lastSequence)) {
      sequence = lastSequence + 1;
    }
  }

  const formattedSequence = sequence.toString().padStart(3, "0");
  return `${userSerial}-CP-${formattedDate}-${formattedSequence}`;
};

module.exports = { buildUserSerial, generatePurchaseSerial };
