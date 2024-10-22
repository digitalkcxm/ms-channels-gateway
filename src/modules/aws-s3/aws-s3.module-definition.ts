import { ConfigurableModuleBuilder } from '@nestjs/common';

import { AwsS3ModuleOptions } from './aws-s3.interface';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<AwsS3ModuleOptions>({
  moduleName: 'AwsS3Module',
})
  .setClassMethodName('forRoot')
  .setExtras({ isGlobal: true }, (definition, extras) => ({
    ...definition,
    global: extras.isGlobal,
  }))
  .build();
