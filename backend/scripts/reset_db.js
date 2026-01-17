require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Entry = require('../models/Entry');
const Otp = require('../models/Otp');

const MONGO_URI = process.env.MONGO_URI;

const resetDb = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const deletedUsers = await User.deleteMany({});
        console.log(`Deleted ${deletedUsers.deletedCount} users`);

        const deletedCategories = await Category.deleteMany({});
        console.log(`Deleted ${deletedCategories.deletedCount} categories`);

        const deletedEntries = await Entry.deleteMany({});
        console.log(`Deleted ${deletedEntries.deletedCount} entries`);

        const deletedOtps = await Otp.deleteMany({});
        console.log(`Deleted ${deletedOtps.deletedCount} OTPs`);

        console.log('Database reset complete');
        process.exit(0);
    } catch (err) {
        console.error('Error resetting database:', err);
        process.exit(1);
    }
};

resetDb();
