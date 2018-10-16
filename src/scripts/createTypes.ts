import { generateNamespace } from '@gql2ts/from-schema';
import * as fs from 'fs';
import * as path from 'path';
import { genSchema } from "../utils/genSchema";

const tsTypes = generateNamespace('GQL', genSchema());

fs.writeFile(path.join(__dirname, '../types/schema.d.ts'), tsTypes, (err) => {
  if (err) { throw err };
});