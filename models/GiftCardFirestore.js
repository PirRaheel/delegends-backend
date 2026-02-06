const { db } = require('../config/firebase');

class GiftCard {
  static collection = db.collection('giftcards');

  static async findOne(query) {
    if (query.code) {
      const snapshot = await this.collection.where('code', '==', query.code).limit(1).get();
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { _id: doc.id, id: doc.id, ...doc.data() };
    }
    return null;
  }

  static async create(data) {
    const docRef = await this.collection.add({
      ...data,
      createdAt: new Date()
    });
    return { _id: docRef.id, id: docRef.id, ...data };
  }

  static async save(giftCardData) {
    if (giftCardData._id || giftCardData.id) {
      const id = giftCardData._id || giftCardData.id;
      await this.collection.doc(id).update(giftCardData);
      return { _id: id, id, ...giftCardData };
    }
    return this.create(giftCardData);
  }
}

module.exports = GiftCard;
