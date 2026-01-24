const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Container = require('../models/containerModel');
const Attachment = require('../models/attachmentModel');
const Assistant = require('../models/assistantModel');
const User = require('../models/userModel');
const Lecturer = require('../models/lecturerModel');
const Lecture = require('../models/LectureModel');
const assistantHomeworkController = require('../controllers/assistantHomeworkController');

// Configuration
let mongoServer;
const NUM_YEARS = 3;
const TERMS_PER_YEAR = 2;
const COURSES_PER_TERM = 5;
const LECTURES_PER_COURSE = 10;
const ATTACHMENTS_PER_LECTURE = 10;

async function setup() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  console.log('Connected to MongoDB Memory Server');

  // Create Lecturer
  const lecturer = await Lecturer.create({
    name: 'Test Lecturer',
    email: 'lecturer@test.com',
    password: 'password123',
    role: 'Lecturer',
    phoneNumber: '1234567890',
    gender: 'male',
    bio: 'Test Bio',
    expertise: 'Test Expertise'
  });

  // Create Assistant
  const assistant = await Assistant.create({
    name: 'Test Assistant',
    email: 'assistant@test.com',
    password: 'password123',
    role: 'Assistant',
    assignedLecturer: lecturer._id,
    phoneNumber: '0987654321',
    gender: 'female'
  });

  console.log('Created Lecturer and Assistant');

  // Create Hierarchy
  const attachments = [];

  // We need to bypass mongoose validation if 'Lecture' discriminator is not registered
  // but we want to simulate data that has kind='Lecture'

  const containersToInsert = [];

  for (let y = 0; y < NUM_YEARS; y++) {
    const yearId = new mongoose.Types.ObjectId();
    containersToInsert.push({
      _id: yearId,
      name: `Year ${y}`,
      type: 'year',
      kind: 'Container', // Default kind if not specified? Or maybe 'Year'? let's assume 'Container' or just no kind if base
      createdBy: lecturer._id,
      parent: null,
      teacherAllowed: true,
      children: []
    });

    for (let t = 0; t < TERMS_PER_YEAR; t++) {
      const termId = new mongoose.Types.ObjectId();
      containersToInsert.push({
        _id: termId,
        name: `Term ${y}-${t}`,
        type: 'term',
        kind: 'Container',
        createdBy: lecturer._id,
        parent: yearId,
        teacherAllowed: true,
        children: []
      });
      // Add to parent's children (we won't update parent doc for speed, just rely on parent field)

      for (let c = 0; c < COURSES_PER_TERM; c++) {
        const courseId = new mongoose.Types.ObjectId();
        containersToInsert.push({
          _id: courseId,
          name: `Course ${y}-${t}-${c}`,
          type: 'course',
          kind: 'Container',
          createdBy: lecturer._id,
          parent: termId,
          teacherAllowed: true,
          children: []
        });

        for (let l = 0; l < LECTURES_PER_COURSE; l++) {
          const lectureId = new mongoose.Types.ObjectId();
          // Here is the key: kind should be 'Lecture' for the controller to pick it up
          containersToInsert.push({
            _id: lectureId,
            name: `Lecture ${y}-${t}-${c}-${l}`,
            type: 'lecture',
            kind: 'Lecture',
            createdBy: lecturer._id,
            parent: courseId,
            teacherAllowed: true,
            children: []
          });

          // Create Attachments
          for (let a = 0; a < ATTACHMENTS_PER_LECTURE; a++) {
            attachments.push({
              fileName: `File ${a}`,
              type: 'homeworks',
              lectureId: lectureId,
              studentId: new mongoose.Types.ObjectId(), // Simulate a student
              uploadedOn: new Date()
            });
          }
        }
      }
    }
  }

  // Insert raw to avoid validation issues with missing discriminators
  await Container.collection.insertMany(containersToInsert);
  await Attachment.collection.insertMany(attachments);

  console.log(`Inserted ${containersToInsert.length} containers and ${attachments.length} attachments`);

  return { assistantId: assistant._id, lecturerId: lecturer._id };
}

async function main() {
  try {
    const { assistantId, lecturerId } = await setup();

    console.log('Starting benchmark...');

    // Mock req, res, next
    const req = {
        user: { _id: assistantId },
        query: {}
    };

    const start = performance.now();

    let resData;
    await new Promise((resolve, reject) => {
        const res = {
            status: function(code) { return this; },
            json: function(data) {
                this.data = data;
                resData = data;
                resolve();
                return this;
            }
        };
        const next = (err) => {
            if(err) {
                console.error(err);
                reject(err);
            } else {
                resolve();
            }
        };

        assistantHomeworkController.getHomeworkHierarchy(req, res, next);
    });

    const end = performance.now();
    console.log(`Execution time: ${(end - start).toFixed(2)} ms`);

    // Validation
    // console.log(JSON.stringify(resData, null, 2));
    if (resData) {
        console.log(`Result count: Top level containers: ${resData.data.containers.length}`);
    } else {
        console.log('No result data');
    }

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
  }
}

main();
