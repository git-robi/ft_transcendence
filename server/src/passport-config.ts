import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
    new GoogleStrategy({
    
        clientID: process.env.ID_CLIENT!,
        clientSecret: process.env.CLIENT_SECRET!,
        callbackURL:'http://localhost:3001/api/v1/auth/google/redirect'
        

}, (accessToken, refreshToken, profile, done) => {
    //passport callback function 
    
    
}))
