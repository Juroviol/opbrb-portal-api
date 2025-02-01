import express from 'express';
import { createHandler } from 'graphql-http/lib/use/express';
import schema from './schemas';
import * as process from 'node:process';
import AuthenticationRoute from './routes/authentication.route';
import mongoose from 'mongoose';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import AuthenticationService from './services/authentication.service';

const app = express();

app.use(passport.initialize());

app.get('/health-check', (_request, response) => {
  response.status(200).send('I am health!');
});

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await AuthenticationService.validateUsernameAndPassword(
        username,
        password
      );
      return done(null, user);
    } catch (e) {
      done(e);
    }
  })
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET as string,
      issuer: 'opbrb',
    },
    async (user, done) => {
      return done(null, user);
    }
  )
);

app.use('/auth', AuthenticationRoute);

app.all(
  '/graphql',
  passport.authenticate('jwt', { session: false }),
  createHandler({
    schema,
  })
);

(async () => {
  await mongoose.connect(process.env.DATABASE_URL as string);
  console.log('Connected to MongoDB');
  app.listen(
    {
      port: process.env.PORT || 8080,
    },
    () => {
      console.log('Server running');
    }
  );
})();
