import jwt from "jsonwebtoken";

export const userMiddleware = (req,res,next) => {
    const token = req.headers.token;

    if(!token){
        return res.status(401).json({
            success:false,
            message:"Auth error"
        })
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(decoded){
            req.userId=decoded.id
            next()
        }
    }catch(err){
        return res.status(403).json({
            success:false,
            message:"Auth error."
        })
    }
}