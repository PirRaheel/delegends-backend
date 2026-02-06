const { db } = require('./config/firebase');
const fs = require('fs');

async function migrateToFirestore() {
  try {
    const backup = JSON.parse(fs.readFileSync('./mongodb-backup.json', 'utf8'));
    
    for (const [collectionName, documents] of Object.entries(backup)) {
      if (documents.length === 0) {
        console.log(`⊘ Skipping empty collection: ${collectionName}`);
        continue;
      }

      console.log(`\nMigrating ${collectionName}...`);
      const collectionRef = db.collection(collectionName);
      
      for (const doc of documents) {
        const { _id, __v, ...data } = doc;
        const docId = _id?.$oid || _id?.toString() || db.collection(collectionName).doc().id;
        
        Object.keys(data).forEach(key => {
          if (data[key]?.$date) {
            data[key] = new Date(data[key].$date);
          }
          if (data[key]?.$oid) {
            data[key] = data[key].$oid;
          }
        });
        
        await collectionRef.doc(docId).set(data);
      }
      
      console.log(`✓ Migrated ${documents.length} documents to ${collectionName}`);
    }
    
    console.log('\n✓ Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrateToFirestore();
