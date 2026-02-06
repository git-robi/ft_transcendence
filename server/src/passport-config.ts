import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GithubStrategy } from 'passport-github2';
import dotenv from 'dotenv';
import { prisma } from './prisma/client';

dotenv.config();

// Google OAuth Strategy
passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_ID_CLIENT!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: 'http://localhost:3001/api/v1/auth/google/redirect'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await prisma.user.findFirst({
                where: { googleId: profile.id },
                include: { profile: true }
            });

            if (user) {
                return done(null, user);
            }

            user = await prisma.user.create({
                data: {
                    email: profile.emails?.[0]?.value || '',
                    googleId: profile.id,
                    password: '',
                    profile: {
                        create: {
                            name: profile.displayName,
                            bio: ''
                        }
                    }
                },
                include: { profile: true }
            });

            done(null, user);
        } catch (err) {
            done(err as Error, undefined);
        }
    })
);

// GitHub OAuth Strategy
passport.use(
    new GithubStrategy({
        clientID: process.env.GITHUB_ID_CLIENT!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        callbackURL: 'http://localhost:3001/api/v1/auth/github/redirect'
    }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
            let user = await prisma.user.findFirst({
                where: { githubId: profile.id },
                include: { profile: true }
            });

            if (user) {
                return done(null, user);
            }

            user = await prisma.user.create({
                data: {
                    email: profile.emails?.[0]?.value || `github_${profile.id}@placeholder.local`, //a placeholder for non-public e-mails on git
                    githubId: profile.id,
                    password: '',
                    profile: {
                        create: {
                            name: profile.displayName || profile.username,
                            bio: ''
                        }
                    }
                },
                include: { profile: true }
            });

            done(null, user);
        } catch (err) {
            done(err as Error, undefined);
        }
    })
);
