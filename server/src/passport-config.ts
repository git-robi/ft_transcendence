import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { prisma } from '../prisma/client';

dotenv.config();

passport.use(
    new GoogleStrategy({
        clientID: process.env.ID_CLIENT!,
        clientSecret: process.env.CLIENT_SECRET!,
        callbackURL: 'http://localhost:3001/api/v1/auth/google/redirect'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists by googleId
            let user = await prisma.users.findFirst({
                where: {
                    googleId: profile.id
                }
            });

            if (user) {
                return done(null, user);
            }

            // Create new user
            user = await prisma.users.create({
                data: {
                    name: profile.displayName,
                    email: profile.emails?.[0]?.value || '',
                    googleId: profile.id,
                    password: '' 
                }
            });

            done(null, user);
        } catch (err) {
            done(err as Error, undefined);
        }
    })
);
