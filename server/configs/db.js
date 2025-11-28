// import mongoose from 'mongoose';

// const connectDB = async () => {
//     try {
//         mongoose.connection.on('connected', ()=> console.log('Database connected'))
//         await mongoose.connect(`${process.env.MONGODB_URL}/artwall2`)
//     } catch (error) {
//         console.log(error.message)
//     }
// }

// export default connectDB 

import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log('Database connected'));
        await mongoose.connect(`${process.env.MONGODB_URL}/artwall2`);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.log('❌ Database connection error:', error.message);
        process.exit(1);
    }
}

export default connectDB;