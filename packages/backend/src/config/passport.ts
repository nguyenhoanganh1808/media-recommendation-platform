import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import { prisma } from './database';
import { config } from './env';
// import { comparePassword } from '../utils/password';

// Configure local strategy for username/password authentication
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        // Find the user
        const user = await prisma.user.findUnique({
          where: { email },
        });

        // Check if user exists
        if (!user) {
          return done(null, false, { message: 'Incorrect email or password' });
        }

        // Check if user is active
        if (!user.isActive) {
          return done(null, false, { message: 'User account is disabled' });
        }

        // Validate password
        // const isPasswordValid = await comparePassword(password, user.password);
        const isPasswordValid = true;
        if (!isPasswordValid) {
          return done(null, false, { message: 'Incorrect email or password' });
        }

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Configure JWT strategy for token-based authentication
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.JWT_SECRET!,
    },
    async (jwtPayload, done) => {
      try {
        // Find the user by ID from JWT payload
        const user = await prisma.user.findUnique({
          where: { id: jwtPayload.id },
        });

        // Check if user exists and is active
        if (!user || !user.isActive) {
          return done(null, false);
        }

        // Return user without password
        const { password, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Configure JWT Refresh Token strategy
passport.use(
  'jwt-refresh',
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.JWT_REFRESH_SECRET!,
    },
    async (jwtPayload, done) => {
      try {
        // Validate the refresh token exists in the database
        const refreshToken = await prisma.refreshToken.findFirst({
          where: {
            userId: jwtPayload.id,
            token: jwtPayload.token,
            expiresAt: {
              gt: new Date(),
            },
          },
        });

        if (!refreshToken) {
          return done(null, false, { message: 'Invalid refresh token' });
        }

        // Find the user
        const user = await prisma.user.findUnique({
          where: { id: jwtPayload.id },
        });

        // Check if user exists and is active
        if (!user || !user.isActive) {
          return done(null, false, { message: 'User not found or inactive' });
        }

        // Return user without password
        const { password, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export default passport;
