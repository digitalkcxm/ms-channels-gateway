import { IS_EMPTY, IS_UUID } from 'class-validator';
import { targetConstructorToSchema } from 'class-validator-jsonschema';
import { IOptions } from 'class-validator-jsonschema/build/options';

export function dtoToJsonSchema(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  targetConstructor: Function,
  userOptions?: Partial<IOptions>,
) {
  return targetConstructorToSchema(targetConstructor, {
    ...userOptions,
    additionalConverters: {
      [IS_UUID]: {
        type: 'string',
        format: 'uuid',
      },
      [IS_EMPTY]: {
        anyOf: [{ type: 'string' }, { type: 'null' }],
      },
      ...userOptions?.additionalConverters,
    },
  });
}
