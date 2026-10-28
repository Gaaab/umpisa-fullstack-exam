import { BadRequestException } from '@nestjs/common';
import { CreateBoardInput } from '../boards/board.inputs.js';
import { validationPipe } from './validation.js';

describe('validationPipe', () => {
  const metadata = { type: 'body' as const, metatype: CreateBoardInput };

  it('trims input before validating', async () => {
    await expect(
      validationPipe.transform({ name: '  Launch  ' }, metadata),
    ).resolves.toMatchObject({ name: 'Launch' });
  });

  it('rejects a blank name with a readable message', async () => {
    await expect(
      validationPipe.transform({ name: '   ' }, metadata),
    ).rejects.toThrow(new BadRequestException('Board name is required'));
  });
});
