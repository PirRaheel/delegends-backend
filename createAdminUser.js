const { db } = require('./config/firebase');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  try {
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
    
    console.log('✅ Admin user created successfully');
    console.log('Document ID:', docRef.id);
    console.log('Email:', adminUser.email);
    console.log('Password: admin123');
    console.log('Role:', adminUser.role);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
