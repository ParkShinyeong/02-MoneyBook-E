import { ApiProperty } from '@nestjs/swagger';

export class ModifyMoneyBookDto {
  @ApiProperty({ description: ' 금액', example: 15000 })
  money: number;

  @ApiProperty({ description: ' income or outcome', example: 1 })
  type: number;

  @ApiProperty({ description: '메모', example: '변경memo1' })
  description: string;
}
