import User from "../models/User.js";
import fs from 'fs';
import imagekit from '../configs/imageKit.js';

// Get User Data using userId from auth middleware
export const getUserData = async (req, res) => {
    try {
        const userId = req.authUserId || req.auth?.userId;
        
        if (!userId) {
            return res.status(401).json({ success: false, message: "User ID not found" });
        }
        
        console.log('🔍 Controller: Looking for user with ID:', userId);
        
        const user = await User.findById(userId);
        if (!user) {
            console.log('❌ Controller: User not found with ID:', userId);
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        console.log('✅ Controller: User found:', user.email);
        res.json({ success: true, user });
    } catch (error) {
        console.log('❌ Controller Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const updateUserData = async (req, res) => {
    try {
        const userId = req.authUserId || req.auth?.userId;
        let { username, bio, location, full_name } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: "User ID not found" });
        }

        const tempUser = await User.findById(userId);
        if (!tempUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Jika username tidak provided, gunakan yang lama
        if (!username) {
            username = tempUser.username;
        }

        // Cek jika username sudah dipakai user lain
        if (tempUser.username !== username) {
            const existingUser = await User.findOne({ username, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Username already taken" 
                });
            }
        }

        const updatedData = {
            username,
            bio: bio || tempUser.bio,
            location: location || tempUser.location, 
            full_name: full_name || tempUser.full_name
        };

        const profile = req.files?.profile?.[0];
        const cover = req.files?.cover?.[0];

        // Handle profile picture upload
        if (profile) {
            try {
                const buffer = fs.readFileSync(profile.path);
                const response = await imagekit.upload({
                    file: buffer,
                    fileName: `profile_${userId}_${Date.now()}`,
                    folder: "/artwall/profiles"
                });

                const url = imagekit.url({
                    path: response.filePath,
                    transformation: [
                        { quality: 'auto' },
                        { format: 'webp' },
                        { width: '512' }
                    ]
                });
                updatedData.profile_picture = url;
                
                // Hapus file temporary
                fs.unlinkSync(profile.path);
            } catch (uploadError) {
                console.error('Profile picture upload error:', uploadError);
                // Continue without failing the whole request
            }
        }

        // Handle cover photo upload
        if (cover) {
            try {
                const buffer = fs.readFileSync(cover.path);
                const response = await imagekit.upload({
                    file: buffer,
                    fileName: `cover_${userId}_${Date.now()}`,
                    folder: "/artwall/covers"
                });

                const url = imagekit.url({
                    path: response.filePath,
                    transformation: [
                        { quality: 'auto' },
                        { format: 'webp' },
                        { width: '1280' }
                    ]
                });
                updatedData.cover_photo = url;
                
                // Hapus file temporary
                fs.unlinkSync(cover.path);
            } catch (uploadError) {
                console.error('Cover photo upload error:', uploadError);
                // Continue without failing the whole request
            }
        }
        
        const user = await User.findByIdAndUpdate(
            userId, 
            updatedData, 
            { new: true, runValidators: true }
        );
        
        res.json({ 
            success: true, 
            user, 
            message: 'Profile updated successfully' 
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Find Users using username, email, location, name
export const discoverUsers = async (req, res) => {
    try {
        const userId = req.authUserId || req.auth?.userId;
        const { input } = req.body;

        if (!input || input.length < 2) {
            return res.status(400).json({ 
                success: false, 
                message: "Search input must be at least 2 characters long" 
            });
        }

        const allUsers = await User.find({
            $or: [
                { username: new RegExp(input, 'i') },
                { email: new RegExp(input, 'i') },
                { full_name: new RegExp(input, 'i') },
                { location: new RegExp(input, 'i') },
            ]
        }).select('-email -__v'); // Exclude sensitive fields

        const filteredUsers = allUsers.filter(user => user._id.toString() !== userId);

        res.json({ success: true, users: filteredUsers });

    } catch (error) {
        console.error('Discover users error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Follow user
export const followUser = async (req, res) => {
    try {
        const userId = req.authUserId || req.auth?.userId;
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        if (userId === id) {
            return res.status(400).json({ success: false, message: 'Cannot follow yourself' });
        }

        const user = await User.findById(userId);
        const toFollowUser = await User.findById(id);

        if (!user || !toFollowUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.following.includes(id)) {
            return res.status(400).json({ 
                success: false, 
                message: 'You are already following this user' 
            });
        }

        // Add to following list
        user.following.push(id);
        await user.save();

        // Add to followers list
        toFollowUser.followers.push(userId);
        await toFollowUser.save();

        res.json({ success: true, message: 'Now you are following this user' });

    } catch (error) {
        console.error('Follow user error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Unfollow user
export const unfollowUser = async (req, res) => {
    try {
        const userId = req.authUserId || req.auth?.userId;
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        const user = await User.findById(userId);
        const toUnfollowUser = await User.findById(id);

        if (!user || !toUnfollowUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Remove from following list
        user.following = user.following.filter(followId => followId.toString() !== id);
        await user.save();

        // Remove from followers list
        toUnfollowUser.followers = toUnfollowUser.followers.filter(
            followerId => followerId.toString() !== userId
        );
        await toUnfollowUser.save();

        res.json({ success: true, message: 'You are no longer following this user' });

    } catch (error) {
        console.error('Unfollow user error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}