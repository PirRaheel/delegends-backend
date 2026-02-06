const { db } = require('../config/firebase');

class GuestCustomer {
  static collection = db.collection('guestcustomers');

  static async findOne(query) {
    if (query.email) {
      const snapshot = await this.collection.where('email', '==', query.email).limit(1).get();
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { _id: doc.id, id: doc.id, ...doc.data() };
    }
    return null;
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

  static async findByIdAndUpdate(id, data) {
    await this.collection.doc(id).update(data);
    return this.findById(id);
  }

  static async save(guestData) {
    if (guestData._id || guestData.id) {
      const id = guestData._id || guestData.id;
      await this.collection.doc(id).update(guestData);
      return this.findById(id);
    }
    return this.create(guestData);
  }
}

module.exports = GuestCustomer;
