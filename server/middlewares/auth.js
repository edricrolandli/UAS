export const protect = async (req, res, next) => {
    try {
        // Clerk middleware sudah menambahkan auth() ke request object
        const auth = req.auth();
        
        if (!auth || !auth.userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not authenticated' 
            });
        }
        
        // Attach userId to request object for use in controllers
        req.authUserId = auth.userId;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ 
            success: false, 
            message: 'Authentication failed: ' + error.message 
        });
    }
};