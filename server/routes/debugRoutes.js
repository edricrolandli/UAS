// routes/debugRoutes.js
import express from 'express';
import { inngest } from '../inngest/index.js';
import User from '../models/User.js';

const debugRouter = express.Router();

// Test manual Inngest trigger
debugRouter.post('/test-inngest', async (req, res) => {
    try {
        const testUserId = 'user_test_' + Date.now();
        const testEmail = 'test' + Date.now() + '@example.com';
        
        console.log('🎯 Triggering Inngest manually...');
        
        await inngest.send({
            name: 'clerk/user.created',
            data: {
                id: testUserId,
                first_name: 'Test',
                last_name: 'User', 
                email_addresses: [{ email_address: testEmail }],
                image_url: 'https://example.com/avatar.jpg',
                username: 'testuser' + Date.now()
            }
        });
        
        res.json({ 
            success: true, 
            message: 'Inngest event triggered',
            userId: testUserId,
            email: testEmail
        });
    } catch (error) {
        console.error('❌ Manual trigger failed:', error);
        res.json({ success: false, error: error.message });
    }
});

// Check user by ID
debugRouter.get('/user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.json({ 
            exists: !!user,
            user: user 
        });
    } catch (error) {
        res.json({ error: error.message });
    }
});

// List all users
debugRouter.get('/all-users', async (req, res) => {
    try {
        const users = await User.find({});
        res.json({ 
            count: users.length,
            users: users.map(u => ({ 
                _id: u._id, 
                email: u.email, 
                username: u.username 
            }))
        });
    } catch (error) {
        res.json({ error: error.message });
    }
});

export default debugRouter;