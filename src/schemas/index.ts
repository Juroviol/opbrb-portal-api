import userSchema from './user.schema';
import pastorSchema from './pastor.schema';
import { mergeSchemas } from '@graphql-tools/schema';

export default mergeSchemas({
  schemas: [userSchema, pastorSchema],
});
