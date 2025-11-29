import fs from "fs";
import imagekit from "../configs/imageKit.js";
import Story from "../models/Story.js";
import User from "../models/User.js";
import { inngest } from "../inngest/index.js";

// Add user story
export const addUserStory = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { content, media_type, background_color } = req.body;
        const media = req.file
        let media_url = ''

        // upload media to imagekit
        if (media_type === 'image' || media_type === 'video'){
            const fileBuffer = fs.readFileSync(media.path)
            const response = await imagekit.upload({
                file: fileBuffer,
                fileName: media.originalname,
            })
            media_url = response.url
        }
        // create story
        const story = await Story.create({
            user: userId,
            content,
            media_url,
            media_type,
            background_color
        })

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

        res.json({success: true})
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message})
    }
}

// get user stories
export const getStories = async (req, res) => {
    try {
        const { userId } = req.auth();
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }

        // User connections and followings
        const userIds = [userId, ...user.connections, ...user.following]

        const stories = await Story.find({
            user: {$in: userIds}
        }).populate('user').sort({ createdAt: -1 });

        res.json ({ success: true, stories});
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message})
    }
}