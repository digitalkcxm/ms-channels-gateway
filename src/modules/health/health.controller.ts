import { Controller, Get } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

import { RabbitMQHealthCheckService } from './rabbit-mq-health-check.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly db: TypeOrmHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly rabbitMQHealthCheck: RabbitMQHealthCheckService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.rabbitMQHealthCheck.check(),
      () => this.db.pingCheck('database'),
      () =>
        this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.5 }),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ]);
  }
}