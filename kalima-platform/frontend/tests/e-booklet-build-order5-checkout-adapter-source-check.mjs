import fs from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), 'utf8');

const checkoutPage = read('src/pages/e-booklets/EBookletCheckoutPage.jsx');
const normalWizard = read('src/pages/checkout/WizardCheckoutPage.jsx');

assert.match(normalWizard, /WizardStepper/, 'normal checkout must keep using WizardStepper');
assert.match(normalWizard, /CartStep/, 'normal checkout must keep using CartStep');
assert.match(normalWizard, /PaymentStep/, 'normal checkout must keep using PaymentStep');

assert.match(checkoutPage, /@\/components\/checkout\/PaymentMethod/, 'eBooklet checkout must import the shared PaymentMethod component');
assert.match(checkoutPage, /@\/components\/checkout\/OrderSummary/, 'eBooklet checkout must import the shared OrderSummary component');
assert.match(checkoutPage, /<PaymentMethod[\s\S]*getPaymentMethods=/, 'eBooklet checkout must render shared PaymentMethod with a payment-method adapter');
assert.match(checkoutPage, /<OrderSummary[\s\S]*items=\{checkoutItems\}[\s\S]*pricing=\{checkoutPricing\}[\s\S]*onPay=\{submitFromSummary\}/, 'eBooklet checkout must render shared OrderSummary with eBooklet adapter data');
assert.doesNotMatch(checkoutPage, /<select[\s\S]*paymentMethodId/, 'eBooklet checkout must not keep custom payment-method select markup');
assert.doesNotMatch(checkoutPage, /summary\.map/, 'eBooklet checkout must not keep custom summary card mapping');

console.log('Build Order 5 e-booklet checkout adapter source contract passed');
