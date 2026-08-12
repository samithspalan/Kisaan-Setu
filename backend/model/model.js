import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    Username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['farmer', 'customer'], required: true, default: 'farmer' },
},{ timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;