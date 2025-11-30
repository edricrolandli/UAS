import express from "express";
import { upload } from "../configs/multer.js";
import { protect } from "../middlewares/auth.js";
import { addUserStory, getStories } from "../controllers/storyController.js";

const storyRouter = express.Router()

storyRouter.post('/create', (req, res, next) => {
    console.log('🔍 [Route] POST /create - before multer');
    next();
}, upload.single('media'), (req, res, next) => {
    console.log(' [Route] POST /create - after multer');
    next();
}, protect, (req, res, next) => {
    console.log(' [Route] POST /create - after auth');
    next();
}, addUserStory)
storyRouter.get('/get', protect, getStories)
storyRouter.get('/get-v2', protect, getStories)

export default storyRouter