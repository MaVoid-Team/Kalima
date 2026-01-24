
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');

// Import models
// Note: We need to require them to ensure they are registered in Mongoose
const User = require('../models/userModel');
// Student inherits from User
const Student = require('../models/studentModel');
const ECProduct = require('../models/ec.productModel');
const ECBook = require('../models/ec.bookModel');
const ECCartItem = require('../models/ec.cartItemModel');
const ECCoupon = require('../models/ec.couponModel');
const ECPurchase = require('../models/ec.purchaseModel');
const ECBookPurchase = require('../models/ec.bookpurchaseModel');
const ECCart = require('../models/ec.cartModel');

async function runBenchmark() {
  let mongoServer;

  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);
    // console.log('Connected to in-memory MongoDB');

    // Create a mock student (User discriminator)
    const user = await Student.create({
      name: 'Test Student',
      email: 'student@example.com',
      password: 'password123',
      // role: 'Student', // discriminator key is set automatically
      gender: 'male',
      phoneNumber: '+201234567890',
      government: 'Cairo',
      administrationZone: 'Nasr City',
    });

    // Verify userSerial
    if (!user.userSerial) {
       console.error('User serial was not generated!');
       user.userSerial = 'ST001';
       await user.save();
    }

    // Create a Cart
    const cart = await ECCart.create({
      user: user._id,
      status: 'active'
    });

    // Create Books
    const books = [];
    const sectionId = new mongoose.Types.ObjectId();
    const subSectionId = new mongoose.Types.ObjectId();

    // console.log('Creating products...');
    for (let i = 0; i < 100; i++) {
      const book = await ECBook.create({
        title: `Book ${i}`,
        price: 100,
        priceAfterDiscount: 90,
        thumbnail: 'thumb.jpg',
        section: sectionId,
        subSection: subSectionId,
        serial: `B${i}`,
        description: 'A book',
        subject: new mongoose.Types.ObjectId(), // Fake subject ID
        whatsAppNumber: '1234567890',
        paymentNumber: '0987654321',
        createdBy: user._id,
      });
      books.push(book);
    }

    // Add items to cart
    // console.log('Adding items to cart...');
    for (const book of books) {
      await cart.addItem(book._id);
    }

    // Fix productSnapshot
    const cartItems = await ECCartItem.find({ cart: cart._id });
    for (const item of cartItems) {
      item.productSnapshot.section = { number: 1, _id: sectionId };
      item.markModified('productSnapshot');
      await item.save();
    }

    const populatedCart = await ECCart.findById(cart._id).populate('items');
    await populatedCart.populate('user');


    const checkoutData = {
      numberTransferredFrom: '123456',
      paymentScreenShot: 'screenshot.jpg',
      nameOnBook: 'Test User',
      numberOnBook: '1234567890',
      seriesName: 'Series 1'
    };

    // console.log('Starting benchmark...');
    const start = process.hrtime.bigint();

    // The method to benchmark
    const purchases = await populatedCart.convertToPurchases(checkoutData);

    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1e6; // Convert to milliseconds

    console.log(`Execution time: ${duration.toFixed(2)}ms`);

    // Verify results
    const purchaseCount = await ECPurchase.countDocuments();
    const bookPurchaseCount = await ECBookPurchase.countDocuments();

    console.log(`Total Purchases: ${purchaseCount}`);
    console.log(`Book Purchases: ${bookPurchaseCount}`);

    if (purchaseCount !== 100) {
      console.error(`ERROR: Expected 100 purchases, got ${purchaseCount}`);
      // process.exit(1);
    }
    if (bookPurchaseCount !== 100) {
      console.error(`ERROR: Expected 100 book purchases, got ${bookPurchaseCount}`);
      // process.exit(1);
    }

  } catch (err) {
    console.error('Benchmark failed:', err);
    process.exit(1);
  } finally {
    if (mongoServer) {
      await mongoose.disconnect();
      await mongoServer.stop();
    }
  }
}

runBenchmark();
