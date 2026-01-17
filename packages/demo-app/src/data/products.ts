export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
}

export const products: Product[] = [
  {
    id: '1',
    title: 'Wireless Bluetooth Headphones',
    description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio quality.',
    price: 149.99,
    compareAtPrice: 199.99,
    image: 'https://placehold.co/400x400/e2e8f0/475569?text=Headphones',
    category: 'Electronics',
    rating: 4.5,
    reviews: 128,
    inStock: true,
  },
  {
    id: '2',
    title: 'Minimalist Leather Wallet',
    description: 'Slim bifold wallet crafted from genuine Italian leather. Holds up to 8 cards with RFID blocking protection.',
    price: 49.99,
    image: 'https://placehold.co/400x400/e2e8f0/475569?text=Wallet',
    category: 'Accessories',
    rating: 4.8,
    reviews: 89,
    inStock: true,
  },
  {
    id: '3',
    title: 'Smart Fitness Watch',
    description: 'Track your health and fitness with heart rate monitoring, GPS, sleep tracking, and 7-day battery life.',
    price: 279.99,
    compareAtPrice: 329.99,
    image: 'https://placehold.co/400x400/e2e8f0/475569?text=Watch',
    category: 'Electronics',
    rating: 4.3,
    reviews: 256,
    inStock: true,
  },
  {
    id: '4',
    title: 'Organic Cotton T-Shirt',
    description: '100% organic cotton crew neck t-shirt. Soft, breathable, and sustainably made.',
    price: 29.99,
    image: 'https://placehold.co/400x400/e2e8f0/475569?text=T-Shirt',
    category: 'Clothing',
    rating: 4.6,
    reviews: 312,
    inStock: true,
  },
  {
    id: '5',
    title: 'Stainless Steel Water Bottle',
    description: 'Double-walled vacuum insulated bottle keeps drinks cold for 24 hours or hot for 12 hours.',
    price: 34.99,
    image: 'https://placehold.co/400x400/e2e8f0/475569?text=Bottle',
    category: 'Home',
    rating: 4.7,
    reviews: 445,
    inStock: true,
  },
  {
    id: '6',
    title: 'Wireless Charging Pad',
    description: 'Fast wireless charger compatible with all Qi-enabled devices. Sleek minimalist design.',
    price: 39.99,
    compareAtPrice: 49.99,
    image: 'https://placehold.co/400x400/e2e8f0/475569?text=Charger',
    category: 'Electronics',
    rating: 4.2,
    reviews: 178,
    inStock: false,
  },
  {
    id: '7',
    title: 'Canvas Backpack',
    description: 'Durable canvas backpack with laptop compartment, multiple pockets, and padded straps.',
    price: 79.99,
    image: 'https://placehold.co/400x400/e2e8f0/475569?text=Backpack',
    category: 'Accessories',
    rating: 4.4,
    reviews: 203,
    inStock: true,
  },
  {
    id: '8',
    title: 'Ceramic Coffee Mug Set',
    description: 'Set of 4 handcrafted ceramic mugs. Microwave and dishwasher safe.',
    price: 44.99,
    image: 'https://placehold.co/400x400/e2e8f0/475569?text=Mugs',
    category: 'Home',
    rating: 4.9,
    reviews: 67,
    inStock: true,
  },
];

export const categories = ['All', 'Electronics', 'Clothing', 'Accessories', 'Home'];

export const cartItems = [
  { product: products[0], quantity: 1 },
  { product: products[3], quantity: 2 },
  { product: products[4], quantity: 1 },
];
