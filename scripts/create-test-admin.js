import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { DB_URL } from '../src/config/index.config.js';

const cartSchema = new mongoose.Schema({ products: [] });
const CartModel = mongoose.model('carts', cartSchema);

const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'user' },
  cartId: mongoose.Schema.Types.ObjectId,
  lastLoginDate: Date,
});
const UserModel = mongoose.model('users', userSchema);

await mongoose.connect(DB_URL);

const USERS = [
  { first_name: 'Admin',   last_name: 'Folio', email: 'admin@folio.com',   password: 'Folio2024!', role: 'admin'   },
  { first_name: 'Usuario', last_name: 'Folio', email: 'user@folio.com',    password: 'Folio2024!', role: 'user'    },
  { first_name: 'Premium', last_name: 'Folio', email: 'premium@folio.com', password: 'Folio2024!', role: 'premium' },
];

for (const u of USERS) {
  const existing = await UserModel.findOne({ email: u.email });
  if (existing) {
    await UserModel.deleteOne({ email: u.email });
    console.log(`🗑  Usuario previo eliminado: ${u.email}`);
  }
  const cart = await CartModel.create({ products: [] });
  const hash = bcrypt.hashSync(u.password, bcrypt.genSaltSync(10));
  await UserModel.create({
    first_name: u.first_name,
    last_name:  u.last_name,
    email:      u.email,
    password:   hash,
    role:       u.role,
    cartId:     cart._id,
    lastLoginDate: new Date(),
  });
  console.log(`✅ ${u.role.padEnd(7)} → ${u.email}  /  ${u.password}`);
}

await mongoose.disconnect();
console.log('\nListo. Podés borrar o cambiar el rol de tu cuenta personal desde el panel admin.');
