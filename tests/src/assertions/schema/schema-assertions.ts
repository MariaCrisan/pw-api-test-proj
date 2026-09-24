import type { JSONSchemaType } from 'ajv';

import { JsonSchemaValidator } from '../../../../app/src/schemas/json-schema-validator';

const validator = new JsonSchemaValidator();

export function expectSchema<T>(
  value: unknown,
  schema: JSONSchemaType<T>,
  description?: string,
): asserts value is T {
  const assertValid: <TValue>(
    candidate: unknown,
    candidateSchema: JSONSchemaType<TValue>,
    candidateDescription?: string,
  ) => asserts candidate is TValue = validator.assertValid.bind(validator);
  assertValid(value, schema, description);
}
