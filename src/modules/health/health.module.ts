import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { RabbitMQConfigFactory } from '@/config/rabbit-mq-config-factory';

import { HealthController } from './health.controller';
import { RabbitMQHealthCheckService } from './rabbit-mq-health-check.service';

@Module({
  imports: [
    HttpModule,
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useClass: RabbitMQConfigFactory,
    }),
    TerminusModule.forRoot({
      errorLogStyle: 'pretty',
      gracefulShutdownTimeoutMs: 10000,
    }),
  ],
  controllers: [HealthController],
  providers: [RabbitMQHealthCheckService],
})
export class HealthModule {}
