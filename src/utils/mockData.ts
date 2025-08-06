// src/utils/mockData.ts
export const stats = {
  totalUsers: 12847,
  activeChats: 1432,
  notifications: 89,
  revenue: 45680,
};

export const recentNotifications = [
  { id: 1, type: 'warning', message: 'Server maintenance scheduled', time: '5 min ago' },
  { id: 2, type: 'success', message: 'Payment received from user #1234', time: '12 min ago' },
  { id: 3, type: 'info', message: 'New product added to catalog', time: '1 hour ago' },
  { id: 4, type: 'error', message: 'Failed payment notification', time: '2 hours ago' },
];

export const recentChats = [
  { id: 1, user: 'John Doe', message: 'Terima kasih untuk bantuan nya', time: '2 min ago', status: 'active' },
  { id: 2, user: 'Jane Smith', message: 'Kapan produk akan dikirim?', time: '5 min ago', status: 'pending' },
  { id: 3, user: 'Bob Wilson', message: 'Saya butuh refund', time: '10 min ago', status: 'urgent' },
];

export const products = [
  { id: 1, name: 'Premium Chat Package', price: 99000, stock: 150, status: 'active' },
  { id: 2, name: 'Basic Subscription', price: 49000, stock: 200, status: 'active' },
  { id: 3, name: 'Enterprise Solution', price: 299000, stock: 50, status: 'inactive' },
];

export const payments = [
  { id: 1, user: 'Ahmad Rizki', amount: 99000, status: 'completed', date: '2024-01-21' },
  { id: 2, user: 'Sari Dewi', amount: 49000, status: 'pending', date: '2024-01-21' },
  { id: 3, user: 'Budi Santoso', amount: 299000, status: 'failed', date: '2024-01-20' },
];

