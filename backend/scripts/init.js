const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const initUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Create initial users
    const users = [
      {
        name: 'Team Leader',
        email: 'admin@solar.com',
        password: 'password',
        role: 'team_leader',
        phone: '+1234567890'
      },
      {
        name: 'Assistant User',
        email: 'assistant@solar.com',
        password: 'password',
        role: 'assistant',
        phone: '+1234567891'
      },
      {
        name: 'Technical Officer',
        email: 'technical@solar.com',
        password: 'password',
        role: 'technical_officer',
        phone: '+1234567892'
      }
    ];

    for (const userData of users) {
      const userExists = await User.findOne({ email: userData.email });
      if (!userExists) {
        await User.create(userData);
        console.log(`Created user: ${userData.email}`);
      }
    }

    console.log('Initial setup completed!');
    process.exit(0);
  } catch (error) {
    console.error('Setup error:', error);
    process.exit(1);
  }
};

initUsers();