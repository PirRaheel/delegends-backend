const { db } = require('../config/firebase');

class Booking {
  static collection = db.collection('bookings');

  static async find(query = {}) {
    let ref = this.collection;
    if (query.user) {
      ref = ref.where('user', '==', query.user);
    }
    if (query.guestCustomer) {
      ref = ref.where('guestCustomer', '==', query.guestCustomer);
    }
    const snapshot = await ref.get();
    return snapshot.docs.map(doc => ({ _id: doc.id, id: doc.id, ...doc.data() }));
  }

  static async findById(id) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return { _id: doc.id, id: doc.id, ...doc.data() };
  }

  static async findOne(query) {
    let ref = this.collection.limit(1);
    if (query.user) ref = ref.where('user', '==', query.user);
    const snapshot = await ref.get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
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

  static async save(bookingData) {
    if (bookingData._id || bookingData.id) {
      const id = bookingData._id || bookingData.id;
      await this.collection.doc(id).update({
        ...bookingData,
        updatedAt: new Date()
      });
      return this.findById(id);
    }
    return this.create(bookingData);
  }

  static populate() {
    return this;
  }
}

module.exports = Booking;
