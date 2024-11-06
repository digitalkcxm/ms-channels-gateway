export class PagedDto<T> {
  total: number;
  offset: number;
  limit: number;
  items: T[];

  private constructor() {}

  static create<T>(items: T[], total: number, offset: number, limit: number) {
    const dto = new PagedDto<T>();

    dto.items = items;
    dto.total = total;
    dto.offset = offset;
    dto.limit = limit;

    return dto;
  }
}
