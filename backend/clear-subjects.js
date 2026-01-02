require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Subject = require('./models/Subject');
  
  const result = await Subject.deleteMany({});
  
  console.log(`\n✅ Deleted ${result.deletedCount} old subjects`);
  console.log('Now create new subjects with the updated form.');
  
  mongoose.connection.close();
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
