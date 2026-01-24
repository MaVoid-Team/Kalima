const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { updateUser } = require('../controllers/userController');
const User = require('../models/userModel');
const Parent = require('../models/parentModel');

let mongoServer;

const setup = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
};

const teardown = async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
};

const runTest = async () => {
  try {
    await setup();

    // Create a user (Parent)
    const parent = await Parent.create({
      name: 'Test Parent',
      email: 'testparent@example.com',
      password: 'password123',
      role: 'Parent',
      phoneNumber: '1234567890',
      gender: 'male',
      administrationZone: 'Test Zone',
      government: 'Test Gov'
    });

    // Mock Req, Res, Next
    const req = {
      params: { userId: parent._id },
      body: {
        children: [] // The invalid input
      },
      user: { _id: parent._id, role: 'Parent' }
    };

    let nextError = null;

    await new Promise((resolve) => {
        const next = (err) => {
          if (err) {
            nextError = err;
            console.log('NEXT CALLED WITH ERROR:', err.message);
          } else {
            console.log('NEXT CALLED WITHOUT ERROR');
          }
          resolve();
        };

        const res = {
          json: (data) => {
            console.log('Response sent successfully (no error caught)');
            resolve();
            return res;
          },
          status: (code) => {
            return res;
          },
          send: (data) => {
              console.log('Response sent successfully (no error caught)');
              resolve();
              return res;
          }
        };

        console.log('Calling updateUser with empty children array...');
        updateUser(req, res, next);
    });

    if (nextError) {
        if (nextError.message === "Children array cannot be empty") {
            console.log('TEST PASSED: Correctly rejected empty children array.');
        } else {
            console.log(`TEST FAILED: Rejected with unexpected error: ${nextError.message}`);
        }
    } else {
        console.log('TEST FAILED: Should have rejected empty children array but did not.');

        // Inspect DB
        const updatedUser = await Parent.findById(parent._id);
        console.log('Updated User Children in DB:', updatedUser.children);
    }

  } catch (error) {
    console.error('Test Execution Error:', error);
  } finally {
    await teardown();
  }
};

runTest();
