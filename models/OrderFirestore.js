const { db } = require('../config/firebase');

class Order {
  static collection = db.collection('orders');

  static async find(query = {}) {
    let ref = this.collection;
    if (query.user) {
      ref = ref.where('user', '==', query.user);
    }
    const snapshot = await ref.get();
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
      createdAt: new Date()
    });
    return { _id: docRef.id, id: docRef.id, ...data };
  }

  static async save(orderData) {
    if (orderData._id || orderData.id) {
      const id = orderData._id || orderData.id;
      await this.collection.doc(id).update(orderData);
      return this.findById(id);
    }
    return this.create(orderData);
  }
}

module.exports = Order;
