const { db } = require('../config/firebase');

class User {
  static collection = db.collection('users');

  static async findOne(query) {
    const snapshot = await this.collection.where('email', '==', query.email).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { _id: doc.id, id: doc.id, ...doc.data() };
  }

  static async findById(id) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return { _id: doc.id, id: doc.id, ...doc.data() };
  }

  static async create(data) {
    const docRef = await this.collection.add({
      ...data,
      createdAt: new Date()
    });
    return { _id: docRef.id, id: docRef.id, ...data };
  }

  static async update(id, data) {
    await this.collection.doc(id).update(data);
    return this.findById(id);
  }
}

module.exports = User;
