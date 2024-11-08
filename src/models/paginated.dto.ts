import { ApiProperty } from '@nestjs/swagger';

export class PaginatedDto<TResults> {
  @ApiProperty()
  total: number;

  @ApiProperty()
  offset: number;

  @ApiProperty()
  limit: number;

  results: TResults[];

  private constructor() {}

  static create<T>(items: T[], total: number, offset: number, limit: number) {
    const dto = new PaginatedDto<T>();

    dto.results = items;
    dto.total = total;
    dto.offset = offset;
    dto.limit = limit;

    return dto;
  }
}
