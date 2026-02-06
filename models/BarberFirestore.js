const { db } = require('../config/firebase');

class Barber {
  static collection = db.collection('barbers');

  static async find(query = {}) {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => ({ _id: doc.id, id: doc.id, ...doc.data() }));
  }

  static async findById(id) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return { _id: doc.id, id: doc.id, ...doc.data() };
  }

  static async findOne(query) {
    if (query.email) {
      const snapshot = await this.collection.where('email', '==', query.email).limit(1).get();
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { _id: doc.id, id: doc.id, ...doc.data() };
    }
    const snapshot = await this.collection.limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
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

  static async findByIdAndDelete(id) {
    await this.collection.doc(id).delete();
    return { _id: id, id };
  }

  static populate() {
    return this;
  }
}

module.exports = Barber;
