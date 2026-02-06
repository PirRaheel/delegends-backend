const { db } = require('../config/firebase');

class JobApplication {
  static collection = db.collection('jobapplications');

  static async find(query = {}) {
    let ref = this.collection;
    if (query.jobId) {
      ref = ref.where('jobId', '==', query.jobId);
    }
    if (query.status) {
      ref = ref.where('status', '==', query.status);
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

module.exports = JobApplication;
