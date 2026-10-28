import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { Transform } from 'class-transformer';

export const Trim = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );

// Joins constraint messages so clients can show them as-is.
export const validationPipe = new ValidationPipe({
  transform: true,
  exceptionFactory: (errors) =>
    new BadRequestException(
      errors.flatMap((e) => Object.values(e.constraints ?? {})).join('; '),
    ),
});
