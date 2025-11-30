import fs from "fs";
import imagekit from "../configs/imageKit.js";
import Story from "../models/Story.js";
import User from "../models/User.js";
import { inngest } from "../inngest/index.js";

// Add user story
export const addUserStory = async (req, res) => {
    try {
        console.log('📖 [Story] Create story request received');
        console.log('📖 [Story] Request body:', req.body);
        console.log('📖 [Story] Request file:', req.file);
        
        const { userId } = req.auth();
        console.log('📖 [Story] User ID from auth:', userId);
        
        const { content, media_type, background_color } = req.body;
        const media = req.file
        let media_url = ''

        console.log('📖 [Story] Story data:', { content, media_type, background_color, media: !!media });

        // upload media to imagekit
        if (media_type === 'image' || media_type === 'video'){
            if (!media) {
                console.error('📖 [Story] Error: media_type is', media_type, 'but no media file provided');
                return res.status(400).json({ success: false, message: 'Media file required for image/video stories' });
            }
            
            // Use buffer from memory storage
            const fileBuffer = media.buffer
            const response = await imagekit.upload({
                file: fileBuffer,
                fileName: media.originalname,
            })
            media_url = response.url
            console.log('📖 [Story] Media uploaded to:', media_url);
        }
        
        // create story
        const story = await Story.create({
            user: userId,
            content,
            media_url,
            media_type,
            background_color
        })
        
        console.log('📖 [Story] Story created successfully:', story._id);
        console.log('📖 [Story] Story data:', JSON.stringify(story, null, 2));

        // schedule story deletion after 24 hours
        console.log('🔍 [Story] Attempting to schedule deletion for story:', story._id);
        console.log('🔍 [Story] Inngest client available:', !!inngest);
        console.log('🔍 [Story] Event Key available:', !!process.env.INNGEST_EVENT_KEY);
        
        try {
            const eventResult = await inngest.send({
                name: 'app/story.delete',
                data: { storyId: story._id }
            });
            console.log('✅ [Story] Inngest event sent successfully:', eventResult);
        } catch (inngestError) {
            console.error('❌ [Story] Failed to send Inngest event:', inngestError);
            console.error('❌ [Story] Error details:', {
                message: inngestError.message,
                status: inngestError.status,
                stack: inngestError.stack
            });
            // Continue with story creation even if Inngest fails
            console.log('⚠️ [Story] Continuing without Inngest scheduling');
        }

        res.json({success: true, storyId: story._id})
    } catch (error) {
        console.error('📖 [Story] Error creating story:', error);
        res.json({ success: false, message: error.message})
    }
}

// get user stories
export const getStories = async (req, res) => {
    try {
        console.log('📖 [Story] Get stories request received');
        
        const { userId } = req.auth();
        console.log('📖 [Story] User ID from auth:', userId);
        
        const user = await User.findById(userId);
        if (!user) {
            console.log('📖 [Story] User not found:', userId);
            return res.json({ success: false, message: 'User not found' })
        }

        console.log('📖 [Story] User found:', user._id);
        console.log('📖 [Story] User connections:', user.connections);
        console.log('📖 [Story] User following:', user.following);

        // User connections and followings
        const userIds = [userId, ...user.connections, ...user.following]
        console.log('📖 [Story] User IDs to fetch stories for:', userIds);

        const stories = await Story.find({
            user: {$in: userIds}
        }).populate('user').sort({ createdAt: -1 });

        console.log('📖 [Story] Found stories:', stories.length);
        console.log('📖 [Story] Stories data:', JSON.stringify(stories, null, 2));

        res.json ({ success: true, stories});
    } catch (error) {
        console.error('📖 [Story] Error getting stories:', error);
        res.json({ success: false, message: error.message})
    }
}