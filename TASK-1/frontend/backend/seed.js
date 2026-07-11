const dotenv=require('dotenv');
dotenv.config();
const bcrypt=require('bcryptjs');
const connectDB=require('./config/db');
const User=require('./models/User');
const Product=require('./models/Product');
const users=require('./data/users');
const products=require('./data/products');

(async()=>{
 await connectDB();
 await User.deleteMany();
 await Product.deleteMany();
 const hashed=[];
 for(const u of users){
   hashed.push({...u,password:await bcrypt.hash(u.password,10)});
 }
 await User.insertMany(hashed);
 await Product.insertMany(products);
 console.log('Database seeded successfully');
 process.exit();
})();
