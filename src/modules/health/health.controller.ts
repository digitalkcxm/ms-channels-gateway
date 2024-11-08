import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

import { PublicRoute } from '@/config/public-route';

import { RabbitMQHealthCheckService } from './rabbit-mq-health-check.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly db: TypeOrmHealthIndicator,
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly rabbitMQHealthCheck: RabbitMQHealthCheckService,
  ) {}

  @Get()
  @PublicRoute()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.rabbitMQHealthCheck.check(),
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ]);
  }
}
