import express from 'express';
import mongoose from 'mongoose';
import { createHandler } from 'graphql-http/lib/use/express';
import { mergeSchemas } from '@graphql-tools/schema';
import userSchema from '@schemas/user.schema';
import expressPlayground from 'graphql-playground-middleware-express';
import * as process from 'node:process';

const app = express();

const schema = mergeSchemas({
  schemas: [userSchema],
});

app.all(
  '/graphql',
  createHandler({
    schema,
  })
);

app.get('/playground', expressPlayground({ endpoint: '/graphql' }));

(async () => {
  await mongoose.connect(process.env.DATABASE_URL as string);
  console.log('Conectado ao MongoDB');
  app.listen({
    port: process.env.PORT || 8080,
  });
})();
