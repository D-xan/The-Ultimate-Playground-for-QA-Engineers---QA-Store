import mockData from '@/data/db.json';

// Simulated delay to mimic network latency
export const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Random latency between 100ms and 1500ms
export const randomDelay = () => delay(Math.floor(Math.random() * 1400) + 100);

export const api = {
  products: {
    getAll: async () => {
      await randomDelay();
      return mockData.products;
    },
    getById: async (id: string) => {
      await randomDelay();
      return mockData.products.find(p => p.id === id);
    },
    getFeatured: async () => {
      await randomDelay();
      return mockData.products.slice(0, 12);
    }
  },
  categories: {
    getAll: async () => {
      await randomDelay();
      return mockData.categories;
    }
  },
  orders: {
    getAll: async () => {
      await randomDelay();
      return mockData.orders;
    }
  }
};
