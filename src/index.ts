import express from 'express';
import { createHandler } from 'graphql-http/lib/use/express';
import schema from './schemas';
import * as process from 'node:process';
import AuthenticationRoute from './routes/authentication.route';
import mongoose from 'mongoose';

const app = express();

app.get('/health-check', (_request, response) => {
  response.status(200).send('I am health!');
});

app.use('/auth', AuthenticationRoute);

app.all(
  '/graphql',
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
