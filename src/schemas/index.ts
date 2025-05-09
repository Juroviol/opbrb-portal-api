import userSchema from './user.schema';
import pastorSchema from './pastor.schema';
import scopesSchema from './scopes.schema';
import profileSchema from './profile.schema';
import { mergeSchemas } from '@graphql-tools/schema';

export default mergeSchemas({
  schemas: [userSchema, pastorSchema, scopesSchema, profileSchema],
});
