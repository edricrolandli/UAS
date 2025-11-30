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
    console.log(' [Route] POST /create - ENTRY POINT');
    console.log(' [Route] Request headers:', Object.keys(req.headers));
    console.log(' [Route] Content-Type:', req.headers['content-type']);
    next();
}, (req, res, next) => {
    console.log(' [Route] POST /create - before multer');
    next();
}, upload.single('media'), (req, res, next) => {
    console.log(' [Route] POST /create - after multer');
    console.log(' [Route] File uploaded:', req.file);
    next();
}, (req, res, next) => {
    console.log(' [Route] POST /create - before auth');
    next();
}, protect, (req, res, next) => {
    console.log(' [Route] POST /create - after auth');
    console.log(' [Route] Auth successful, calling controller...');
    next();
}, addUserStory)
storyRouter.get('/get', protect, getStories)
storyRouter.get('/get-v3', protect, getStories)

export default storyRouter