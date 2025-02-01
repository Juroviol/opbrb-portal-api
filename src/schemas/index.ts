import userSchema from '@schemas/user.schema';
import pastorSchema from '@schemas/pastor.schema';
import { mergeSchemas } from '@graphql-tools/schema';

export default mergeSchemas({
  schemas: [userSchema, pastorSchema],
});
