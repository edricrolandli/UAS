// import express from 'express';
// import cors from 'cors';
// import 'dotenv/config';
// import connectDB from './configs/db.js';
// import {inngest, functions} from './inngest/index.js'
// import {serve} from 'inngest/express'
// import { clerkMiddleware } from '@clerk/express'
// import userRouter from './routes/userRoutes.js';

// const app = express();

// await connectDB();

// app.use(express.json());
// app.use(cors());
// app.use(clerkMiddleware());
// app.use('/api/user', userRouter);


// app.get('/', (req, res)=> res.send('Server is running'))
// app.use('/api/inngest', serve({client: inngest, functions}))
// app.use('/api/user', userRouter)

// const PORT = process.env.PORT || 4000;

// app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`))

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { inngest, functions } from './inngest/index.js';
import { serve } from 'inngest/express';
import { clerkMiddleware } from '@clerk/express';
import userRouter from './routes/userRoutes.js';

const app = express();

// Connect to database first
try {
    await connectDB();
    console.log('✅ Database connected successfully');
} catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
}

// Middleware
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

// Routes
app.get('/', (req, res) => res.json({ 
    success: true, 
    message: 'ArtWall Server is running',
    timestamp: new Date().toISOString()
}));

// Inngest endpoint - pastikan path ini spesifik
app.use('/api/inngest', serve({ client: inngest, functions }));

// User routes
app.use('/api/user', userRouter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        success: true, 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'ArtWall Server'
    });
});

// 404 handler - HAPUS ROUTE WILDCARD YANG MENGGUNAKAN '*'
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Route not found',
        path: req.path,
        method: req.method
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));