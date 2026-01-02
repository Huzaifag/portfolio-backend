const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://huzaifa6715:yye90IcdfsaEwBQg@portfolio-cluster.2f6mfh9.mongodb.net/?retryWrites=true&w=majority&appName=portfolio-cluster';

async function seedAdmin() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const exists = await Admin.findOne({ username: 'huzaifa0396715' });
  if (exists) {
    console.log('Admin already exists.');
    process.exit(0);
  }
  const admin = new Admin({ username: 'huzaifa0396715', password: 'lahorelahorea' });
  await admin.save();
  console.log('Admin user created!');
  process.exit(0);
}

seedAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
