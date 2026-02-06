const { db } = require('../config/firebase');

class Product {
  static collection = db.collection('products');

  static async find(query = {}) {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => ({ _id: doc.id, id: doc.id, ...doc.data() }));
  }

  static async findById(id) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return { _id: doc.id, id: doc.id, ...doc.data() };
  }

  static async create(data) {
    const docRef = await this.collection.add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { _id: docRef.id, id: docRef.id, ...data };
  }

  static async findByIdAndUpdate(id, data) {
    await this.collection.doc(id).update({
      ...data,
      updatedAt: new Date()
    });
    return this.findById(id);
  }

  static async findByIdAndDelete(id) {
    await this.collection.doc(id).delete();
    return { _id: id, id };
  }
}

module.exports = Product;
