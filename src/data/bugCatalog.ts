export interface PlantedBug {
  id: string;
  area: 'Cart' | 'Products' | 'Search' | 'Checkout';
  symptom: string;
}

export const PLANTED_BUGS: PlantedBug[] = [
  { id: 'cart-subtotal-qty', area: 'Cart', symptom: 'Subtotal ignores the quantity of the last item' },
  { id: 'cart-tax-rate', area: 'Cart', symptom: 'Tax labelled 8% is charged at 18%' },
  { id: 'deals-sort-order', area: 'Products', symptom: 'Weekly Deals shows the smallest discounts first' },
  { id: 'search-case', area: 'Search', symptom: 'Search is case-sensitive' },
  { id: 'cart-remove-wrong', area: 'Cart', symptom: 'Removing an item removes the first line instead' },
  { id: 'checkout-email', area: 'Checkout', symptom: 'Checkout accepts an email address without @' },
];

/** Plausible-sounding reports that are NOT bugs in the store (correct behaviour or not planted). */
export const DECOY_SYMPTOMS: { area: PlantedBug['area']; symptom: string }[] = [
  { area: 'Cart', symptom: 'Quantity cannot go below 1' },
  { area: 'Cart', symptom: 'Shipping is always free' },
  { area: 'Products', symptom: 'Product cards show the sale price, not the list price' },
  { area: 'Products', symptom: 'Low Stock badge shows for items with fewer than 10 in stock' },
  { area: 'Search', symptom: 'The results heading shows how many products were found' },
  { area: 'Search', symptom: 'An empty search does nothing' },
  { area: 'Checkout', symptom: 'Postal code accepts letters' },
  { area: 'Checkout', symptom: 'Placing an order empties the cart' },
];
