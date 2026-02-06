const { db } = require('./config/firebase');
const bcrypt = require('bcryptjs');

async function deleteAndCreateAdmin() {
  try {
    // Delete all existing admin users
    const snapshot = await db.collection('users').where('email', '==', 'admin@salon.com').get();
    const deletePromises = [];
    snapshot.forEach(doc => {
      deletePromises.push(db.collection('users').doc(doc.id).delete());
    });
    await Promise.all(deletePromises);
    console.log(`🗑️  Deleted ${deletePromises.length} existing admin users`);
    
    // Create fresh admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = {
      name: 'Admin User',
      email: 'admin@salon.com',
      password: hashedPassword,
      role: 'admin',
      phone: '',
      createdAt: new Date()
    };

    const docRef = await db.collection('users').add(adminUser);
    
    // Verify password works
    const isValid = await bcrypt.compare('admin123', hashedPassword);
    
    console.log('✅ Admin user created successfully');
    console.log('Document ID:', docRef.id);
    console.log('Email:', adminUser.email);
    console.log('Password: admin123');
    console.log('Role:', adminUser.role);
    console.log('Password Verification:', isValid ? '✅ VALID' : '❌ INVALID');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deleteAndCreateAdmin();
