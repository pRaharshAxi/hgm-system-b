/* eslint-disable prettier/prettier, @typescript-eslint/no-explicit-any */
import { Client } from '@elastic/elasticsearch';

const esClient = new Client({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || 'hgm_elastic_password',
  },
  tls: { rejectUnauthorized: false },
});

const sampleListings = [
  { id: '1', title: 'Fresh Jaffna Mangoes', description: 'Sweet and juicy Karthakolomban mangoes.', category: 'FRUITS', price: 250, quantity: 50, unit: 'kg', supplierId: 'sup-1', supplierName: 'Jaffna Fresh', supplierRating: 4.8, latitude: 6.9271, longitude: 79.8612, location: { lat: 6.9271, lon: 79.8612 }, images: [], isActive: true, createdAt: new Date('2026-01-01') },
  { id: '2', title: 'Organic Red Tomatoes', description: 'Farm fresh organic tomatoes grown in Nuwara Eliya.', category: 'VEGETABLES', price: 180, quantity: 100, unit: 'kg', supplierId: 'sup-2', supplierName: 'Hill Country Greens', supplierRating: 4.5, latitude: 6.9147, longitude: 79.8778, location: { lat: 6.9147, lon: 79.8778 }, images: [], isActive: true, createdAt: new Date('2026-01-02') },
  { id: '3', title: 'Hot Green Chillies', description: 'Spicy home-grown green chillies from Colombo gardens.', category: 'VEGETABLES', price: 400, quantity: 30, unit: 'kg', supplierId: 'sup-3', supplierName: 'Colombo Garden Hub', supplierRating: 4.2, latitude: 6.9016, longitude: 79.8547, location: { lat: 6.9016, lon: 79.8547 }, images: [], isActive: true, createdAt: new Date('2026-01-03') },
  { id: '4', title: 'Fresh King Coconuts', description: 'Hydrating Thambili picked fresh daily.', category: 'FRUITS', price: 120, quantity: 80, unit: 'item', supplierId: 'sup-4', supplierName: 'Island Coco', supplierRating: 4.9, latitude: 6.8911, longitude: 79.8711, location: { lat: 6.8911, lon: 79.8711 }, images: [], isActive: true, createdAt: new Date('2026-01-04') },
  { id: '5', title: 'Organic Gotukola', description: 'Freshly harvested centella asiatica leaves.', category: 'HERBS', price: 80, quantity: 60, unit: 'bunch', supplierId: 'sup-5', supplierName: 'Green Leaf Farm', supplierRating: 4.6, latitude: 6.9388, longitude: 79.8542, location: { lat: 6.9388, lon: 79.8542 }, images: [], isActive: true, createdAt: new Date('2026-01-05') },
  { id: '6', title: 'Ceylon Cinnamon Sticks', description: 'Pure high grade Sri Lankan spice.', category: 'SPICES', price: 850, quantity: 25, unit: 'pack', supplierId: 'sup-6', supplierName: 'Southern Spices', supplierRating: 4.9, latitude: 6.9100, longitude: 79.8800, location: { lat: 6.9100, lon: 79.8800 }, images: [], isActive: true, createdAt: new Date('2026-01-06') },
  { id: '7', title: 'Red Onions', description: 'Crisp home-grown local red onions.', category: 'VEGETABLES', price: 320, quantity: 45, unit: 'kg', supplierId: 'sup-7', supplierName: 'Urban Veggie', supplierRating: 4.1, latitude: 6.8800, longitude: 79.8600, location: { lat: 6.8800, lon: 79.8600 }, images: [], isActive: true, createdAt: new Date('2026-01-07') },
  { id: '8', title: 'Sweet Papaya', description: 'Ripe red lady papaya from backyard orchard.', category: 'FRUITS', price: 200, quantity: 40, unit: 'kg', supplierId: 'sup-8', supplierName: 'Tropical Harvest', supplierRating: 4.7, latitude: 6.9200, longitude: 79.8500, location: { lat: 6.9200, lon: 79.8500 }, images: [], isActive: true, createdAt: new Date('2026-01-08') },
  { id: '9', title: 'Organic Curry Leaves', description: 'Aromatic Karapincha leaves for local cooking.', category: 'HERBS', price: 50, quantity: 100, unit: 'bunch', supplierId: 'sup-9', supplierName: 'Home Herb Garden', supplierRating: 4.4, latitude: 6.9400, longitude: 79.8700, location: { lat: 6.9400, lon: 79.8700 }, images: [], isActive: true, createdAt: new Date('2026-01-09') },
  { id: '10', title: 'Fresh Lemongrass', description: 'Fragrant stalks ideal for tea and recipes.', category: 'HERBS', price: 150, quantity: 35, unit: 'pack', supplierId: 'sup-10', supplierName: 'Nature Herbal', supplierRating: 4.3, latitude: 6.9050, longitude: 79.8650, location: { lat: 6.9050, lon: 79.8650 }, images: [], isActive: true, createdAt: new Date('2026-01-10') },
];

async function seed() {
  console.log('Seeding Elasticsearch with 10 Sri Lankan listings...');
  for (const listing of sampleListings) {
    await esClient.index({
      index: 'hgm_listings',
      id: listing.id,
      document: listing,
    });
  }
  console.log('Seeding complete!');
}

seed().catch(console.error);
