import Ajv, { type JSONSchemaType, type ValidateFunction } from 'ajv';

export class JsonSchemaValidator {
  private readonly ajv: Ajv;

  public constructor() {
    this.ajv = new Ajv({ allErrors: true, strict: false });
  }

  public compile<T>(schema: JSONSchemaType<T>): ValidateFunction<T> {
    return this.ajv.compile<T>(schema);
  }

  public assertValid<T>(
    value: unknown,
    schema: JSONSchemaType<T>,
    description = 'value',
  ): asserts value is T {
    const validate = this.compile(schema);
    if (!validate(value)) {
      const details = validate.errors
        ?.map((error) => `${error.instancePath || '/'} ${error.message}`)
        .join('; ');
      throw new Error(`${description} does not match JSON Schema${details ? `: ${details}` : '.'}`);
    }
  }
}
