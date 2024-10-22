import { PutObjectCommandInput, S3 } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Inject, Injectable } from '@nestjs/common';

import { AwsS3ModuleOptions } from './aws-s3.interface';
import { MODULE_OPTIONS_TOKEN } from './aws-s3.module-definition';

@Injectable()
export class AwsS3Service {
  constructor(@Inject(MODULE_OPTIONS_TOKEN) options: AwsS3ModuleOptions) {
    this.client = new S3(options);
  }

  private readonly client: S3;

  public async upload(options: PutObjectCommandInput) {
    const result = await new Upload({
      client: this.client,
      params: options,
    }).done();

    return result.Location;
  }
}
