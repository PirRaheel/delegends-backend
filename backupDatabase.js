const mongoose = require('mongoose');
require('dotenv').config();

const collections = [
  'users',
  'barbers',
  'services',
  'bookings',
  'reviews',
  'products',
  'orders',
  'salons',
  'giftcards'
];

async function backupDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MongoDB URI not found');
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const backup = {};

    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const data = await collection.find({}).toArray();
        backup[collectionName] = data;
        console.log(`✓ Backed up ${collectionName}: ${data.length} documents`);
      } catch (error) {
        console.log(`× Collection ${collectionName} not found or error: ${error.message}`);
        backup[collectionName] = [];
      }
    }

    const fs = require('fs');
    const backupPath = './mongodb-backup.json';
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    console.log(`\n✓ Backup saved to: ${backupPath}`);
    
    // Summary
    console.log('\n=== BACKUP SUMMARY ===');
    for (const [collection, data] of Object.entries(backup)) {
      console.log(`${collection}: ${data.length} documents`);
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Backup error:', error);
    process.exit(1);
  }
}

backupDatabase();
