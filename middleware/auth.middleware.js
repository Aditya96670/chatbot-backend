import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";


export const authUser = async (req, res, next) => {

     try {
        const token = req.cookies.token || req.headers.authorization.split(" ")[ 1 ];
        console.log(`Token: ${token} and Cookies.token: ${req.cookies.token}`)
         
        if(!token){
          console.log(`!undefined: ${!undefined}`)
            return res.status(401).send({ error: 'Unauthorized User'});

        }

     const isBlacklisted = await redisClient.get(token);
     if (isBlacklisted) {
      console.log(`User blacklisted`)
   
         res.cookie('token', '');


        return res.status(401).send({ error: 'Unauthorized User' });
     }

     const decoded = jwt.verify(token, process.env.JWT_SECRET);
     req.user = decoded;
     console.log(`Res.user: ${JSON.stringify(req.user, null, 2)} and Decoded: ${decoded}`)
     next();
}
  catch (error) {
    console.error(`Error validating user: `, error)
    res.status(401).send({ error: 'Unauthorized User' });
  }    

    }