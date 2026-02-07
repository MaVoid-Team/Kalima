// Static mock data for checkout page - no API integration
export const orderItems = [
  {
    id: 1,
    name: "Digital Math Workbook - Grade 5",
    type: "PDF Download",
    price: 15.00,
    quantity: 1,
    image: "https://placehold.co/60x60/fee2e2/dc2626?text=📚"
  },
  {
    id: 2,
    name: "Complete Art Supplies Kit",
    type: "Physical Item",
    price: 45.00,
    quantity: 1,
    image: "https://placehold.co/60x60/fee2e2/dc2626?text=🎨"
  }
];

export const pricingData = {
  subtotal: 60.00,
  shipping: 5.00,
  taxes: 4.80,
  total: 69.80
};

export const steps = [
  { number: 1, label: "Information" },
  { number: 2, label: "Shipping" },
  { number: 3, label: "Payment" }
];
