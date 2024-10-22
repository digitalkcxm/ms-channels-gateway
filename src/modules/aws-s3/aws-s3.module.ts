import { DynamicModule, Module } from '@nestjs/common';

import {
  ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
} from './aws-s3.module-definition';
import { AwsS3Service } from './aws-s3.service';

@Module({})
export class AwsS3Module extends ConfigurableModuleClass {
  static forRoot(options: typeof OPTIONS_TYPE): DynamicModule {
    return {
      module: AwsS3Module,
      global: options.isGlobal || true,
      providers: [
        AwsS3Service,
        {
          provide: MODULE_OPTIONS_TOKEN,
          useValue: options,
        },
      ],
      exports: [AwsS3Service],
    };
  }

  static forRootAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return {
      module: AwsS3Module,
      global: options.isGlobal || true,
      imports: options.imports,
      providers: [
        AwsS3Service,
        {
          provide: MODULE_OPTIONS_TOKEN,
          useClass: options.useClass,
          useExisting: options.useExisting,
          useFactory: options.useFactory,
          inject: options.inject,
        },
      ],
      exports: [AwsS3Service],
    };
  }
}
