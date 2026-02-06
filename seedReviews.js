const mongoose = require('mongoose');
const Review = require('./models/Review');
require('dotenv').config();

const reviews = [
  {
    customerName: 'velvilie kumanan',
    serviceName: 'Blow Dry',
    barberName: 'Marcus',
    rating: 5,
    comment: 'Stumbled on this hairdresser by chance, so glad that I did! Such a lovely, sweet person, haircut was great, a great experience. Will definitely be going back and telling friends & family.',
    isVerified: true,
    status: 'approved',
    createdAt: new Date(Date.now() - 21 * 60 * 60 * 1000)
  },
  {
    customerName: 'Vicky',
    serviceName: 'Blow Dry',
    barberName: 'James',
    rating: 5,
    comment: 'Would highly recommend this salon. I booked a last minute blow-dry and showed the barber a picture of what I wanted. He was amazing and highly skilled and did a great job on my hair. I was very happy and would definitely go back again.',
    isVerified: true,
    venueReply: 'Thank you so much for your kind words! We look forward to seeing you again soon.',
    status: 'approved',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    customerName: 'Ioana',
    serviceName: "Men's Haircut & Styling",
    barberName: 'Marcus',
    rating: 5,
    comment: 'I went in for a haircut and had such a great experience with Marcus. He was amazing, warm, welcoming, and incredibly skilled. I came in with an idea, and he took the time to ask the right questions, give thoughtful advice, and really understand what I wanted to achieve. I felt listened to and completely confident in his hands. I absolutely love the result and would 100% recommend him to anyone!',
    isVerified: true,
    venueReply: 'We appreciate your wonderful feedback! Marcus is thrilled to hear you loved your haircut. See you next time!',
    status: 'approved',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  },
  {
    customerName: 'Dani',
    serviceName: 'Beard Trim & Shape',
    barberName: 'Alex',
    rating: 5,
    comment: 'Alex is great - very professional and friendly. The beard trim was perfect.',
    isVerified: true,
    venueReply: 'Thanks for choosing us, Dani! We are glad Alex took great care of you.',
    status: 'approved',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    customerName: 'Rhian',
    serviceName: 'Premium Cut & Style',
    barberName: 'James',
    rating: 5,
    comment: 'Fantastic experience with James. He listened well to what I wanted and gave helpful advice and tips for future visits to maintain the style I want!',
    isVerified: true,
    status: 'approved',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
  },
  {
    customerName: 'Tom Williams',
    serviceName: 'Hot Towel Shave',
    barberName: 'Alex',
    rating: 5,
    comment: 'Best hot towel shave I have ever had. Alex is a true professional and made me feel completely relaxed. The attention to detail was incredible.',
    isVerified: true,
    venueReply: 'Thank you Tom! We are delighted you enjoyed the experience. Come back soon!',
    status: 'approved',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    customerName: 'Michael Chen',
    serviceName: "Men's Haircut & Styling",
    barberName: 'Marcus',
    rating: 5,
    comment: 'Marcus gave me exactly what I asked for. Clean fade, perfect lineup. Great atmosphere and professional service throughout.',
    isVerified: true,
    status: 'approved',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
  },
  {
    customerName: 'David Brown',
    serviceName: 'Premium Cut & Style',
    barberName: 'James',
    rating: 5,
    comment: 'James is my go-to barber now. Always consistent, always professional. He knows exactly how I like my hair and delivers every time.',
    isVerified: true,
    venueReply: 'We appreciate your loyalty, David! James is happy to be your regular barber.',
    status: 'approved',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  },
  {
    customerName: 'Sam Parker',
    serviceName: 'Beard Trim & Shape',
    barberName: 'Alex',
    rating: 5,
    comment: 'Alex transformed my beard. He really knows what he is doing and gave me great advice on maintaining it at home. Will definitely be back.',
    isVerified: true,
    status: 'approved',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
  },
  {
    customerName: 'Ryan Thompson',
    serviceName: "Men's Haircut & Styling",
    barberName: 'Marcus',
    rating: 5,
    comment: 'Great cut, great service. Marcus took his time and made sure everything was perfect. The whole team is friendly and professional.',
    isVerified: true,
    venueReply: 'Thanks Ryan! We are proud of our team and glad you had a great experience.',
    status: 'approved',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  }
];

async function seedReviews() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MongoDB URI not found in environment variables');
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    await Review.deleteMany({});
    console.log('Cleared existing reviews');

    await Review.insertMany(reviews);
    console.log(`Successfully seeded ${reviews.length} reviews`);

    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding reviews:', error);
    process.exit(1);
  }
}

seedReviews();
