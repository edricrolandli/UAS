// export const protect = async (req, res, next) => {
//     try {
//         const {userId} = await req.auth();
//         if(!userId){
//             return res.json({success: false, message: 'not authenticated'})   
//         }
//         next()
//     } catch (error) {
//         res.json({success: false, message: error.message})   
//     }
// }

export const protect = async (req, res, next) => {
    try {
        const { userId } = await req.auth();
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        req.authUserId = userId; // Tambahkan ini untuk konsistensi
        next();
    } catch (error) {
        console.log('Auth middleware error:', error);
        res.status(401).json({ success: false, message: error.message });
    }
}