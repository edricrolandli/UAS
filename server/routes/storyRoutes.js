import express from "express";
import { upload } from "../configs/multer.js";
import { protect } from "../middlewares/auth.js";
import { addUserStory, getStories } from "../controllers/storyController_debug.js";

const storyRouter = express.Router()

// Test route
storyRouter.get('/test', (req, res) => {
    console.log(' [STORY TEST] Test route called!');
    res.json({ success: true, message: 'Story routes working!' });
});

storyRouter.post('/create', (req, res, next) => {
    console.log(' [Route] POST /create - before multer');
    next();
}, upload.single('media'), (req, res, next) => {
    console.log(' [Route] POST /create - after multer');
    next();
}, protect, (req, res, next) => {
    console.log(' [Route] POST /create - after auth');
    next();
}, addUserStory)
storyRouter.get('/get', protect, getStories)
storyRouter.get('/get-v3', protect, getStories)

export default storyRouter