import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';

// Helper to generate multiple items
const generate = (count, generator) => Array.from({ length: count }, generator);

// 50 Brands
const brands = generate(50, () => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
  logo: faker.image.urlLoremFlickr({ category: 'business' }),
  description: faker.company.catchPhrase(),
}));

// 100 Categories
const categories = generate(100, () => ({
  id: faker.string.uuid(),
  name: faker.commerce.department(),
  slug: faker.helpers.slugify(faker.commerce.department()).toLowerCase(),
  image: faker.image.urlLoremFlickr({ category: 'fashion' }),
  parentId: faker.datatype.boolean({ probability: 0.7 }) ? faker.string.uuid() : null, // mock hierarchy
}));

// 1000 Products
const products = generate(1000, () => {
  const price = parseFloat(faker.commerce.price({ min: 10, max: 1000 }));
  const discount = faker.datatype.boolean({ probability: 0.3 }) ? faker.number.int({ min: 5, max: 50 }) : 0;
  return {
    id: faker.string.uuid(),
    sku: faker.string.alphanumeric(8).toUpperCase(),
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price,
    salePrice: discount > 0 ? parseFloat((price * (1 - discount / 100)).toFixed(2)) : price,
    discount,
    stock: faker.number.int({ min: 0, max: 500 }),
    rating: faker.number.float({ min: 1, max: 5, multipleOf: 0.1 }),
    reviewsCount: faker.number.int({ min: 0, max: 1000 }),
    categoryId: faker.helpers.arrayElement(categories).id,
    brandId: faker.helpers.arrayElement(brands).id,
    images: [
      faker.image.urlLoremFlickr({ category: 'product' }),
      faker.image.urlLoremFlickr({ category: 'product' }),
      faker.image.urlLoremFlickr({ category: 'product' })
    ],
    attributes: {
      color: faker.helpers.arrayElements(['Red', 'Blue', 'Green', 'Black', 'White', 'Silver', 'Gold'], { min: 1, max: 3 }),
      size: faker.helpers.arrayElements(['XS', 'S', 'M', 'L', 'XL', 'XXL'], { min: 1, max: 4 }),
      material: faker.commerce.productMaterial()
    },
    status: faker.helpers.arrayElement(['Active', 'Active', 'Active', 'Draft', 'Archived']),
    createdAt: faker.date.past().toISOString(),
  };
});

// 250 Orders
const orders = generate(250, () => ({
  id: faker.string.uuid(),
  orderNumber: `ORD-${faker.string.alphanumeric(6).toUpperCase()}`,
  customerId: faker.string.uuid(),
  customerName: faker.person.fullName(),
  customerEmail: faker.internet.email(),
  totalAmount: parseFloat(faker.commerce.price({ min: 50, max: 2000 })),
  status: faker.helpers.arrayElement(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']),
  paymentStatus: faker.helpers.arrayElement(['Paid', 'Pending', 'Failed', 'Refunded']),
  items: generate(faker.number.int({ min: 1, max: 5 }), () => ({
    productId: faker.helpers.arrayElement(products).id,
    name: faker.commerce.productName(),
    quantity: faker.number.int({ min: 1, max: 3 }),
    price: parseFloat(faker.commerce.price({ min: 10, max: 500 }))
  })),
  createdAt: faker.date.recent({ days: 90 }).toISOString(),
}));

// 500 Reviews
const reviews = generate(500, () => ({
  id: faker.string.uuid(),
  productId: faker.helpers.arrayElement(products).id,
  customerName: faker.person.fullName(),
  rating: faker.number.int({ min: 1, max: 5 }),
  title: faker.lorem.sentence(),
  comment: faker.lorem.paragraph(),
  helpfulVotes: faker.number.int({ min: 0, max: 100 }),
  verifiedPurchase: faker.datatype.boolean({ probability: 0.8 }),
  createdAt: faker.date.recent({ days: 120 }).toISOString(),
}));

// 100 Coupons
const coupons = generate(100, () => ({
  id: faker.string.uuid(),
  code: faker.string.alphanumeric(8).toUpperCase(),
  discountType: faker.helpers.arrayElement(['percentage', 'fixed']),
  discountValue: faker.number.int({ min: 5, max: 50 }),
  minimumOrder: faker.number.int({ min: 0, max: 100 }),
  usageLimit: faker.number.int({ min: 10, max: 1000 }),
  usedCount: faker.number.int({ min: 0, max: 500 }),
  status: faker.helpers.arrayElement(['Active', 'Expired', 'Disabled']),
  expiresAt: faker.date.future().toISOString(),
}));

// 100 Notifications
const notifications = generate(100, () => ({
  id: faker.string.uuid(),
  title: faker.lorem.sentence(),
  message: faker.lorem.paragraph(),
  type: faker.helpers.arrayElement(['Orders', 'Offers', 'System', 'Security']),
  isRead: faker.datatype.boolean({ probability: 0.6 }),
  createdAt: faker.date.recent({ days: 30 }).toISOString(),
}));

// 100 Addresses
const addresses = generate(100, () => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  name: faker.person.fullName(),
  phone: faker.phone.number(),
  country: faker.location.country(),
  state: faker.location.state(),
  city: faker.location.city(),
  area: faker.location.streetAddress(),
  postalCode: faker.location.zipCode(),
  type: faker.helpers.arrayElement(['Home', 'Office', 'Other']),
  isDefault: faker.datatype.boolean({ probability: 0.2 }),
}));

// 50 Payment Methods
const paymentMethods = generate(50, () => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  type: faker.helpers.arrayElement(['Credit Card', 'UPI', 'PayPal']),
  last4: faker.finance.creditCardNumber().slice(-4),
  provider: faker.helpers.arrayElement(['Visa', 'MasterCard', 'Amex', 'PayPal']),
  isDefault: faker.datatype.boolean({ probability: 0.2 }),
}));

const db = {
  brands,
  categories,
  products,
  orders,
  reviews,
  coupons,
  notifications,
  addresses,
  paymentMethods,
};

fs.writeFileSync(path.resolve('./src/data/db.json'), JSON.stringify(db, null, 2));
console.log('Successfully generated src/data/db.json');
