import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Error:', err));

const storeData = async () => {
    try {
        console.log('Calling API to store crop prices...');
        const response = await axios.post('http://localhost:5000/api/store-crop-prices', null, {
            headers: { 'x-admin-secret': process.env.ADMIN_SECRET }
        });
        console.log('✅ Success:', response.data);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        process.exit(1);
    }
};

setTimeout(() => {
    storeData();
}, 2000);
