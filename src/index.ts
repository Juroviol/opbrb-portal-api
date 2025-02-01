import express from 'express';
import mongoose from 'mongoose';
import { createHandler } from 'graphql-http/lib/use/express';
import schema from '@schemas';
import * as process from 'node:process';
import AuthenticationRoute from '@routes/authentication.route';

const app = express();

app.get('/health-check', (_request, response) => {
  response.status(200).send('I am health');
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
  console.log('Conectado ao MongoDB');
  app.listen({
    port: process.env.PORT || 8080,
  });
})();
