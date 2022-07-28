import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { MoneyType } from '../type/moneyBook.enum';

export class CreateMoneyBookDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ description: ' 금액', example: 1000 })
  money: number;

  @IsNotEmpty()
  @IsNumber()
  @IsEnum(MoneyType)
  @ApiProperty({
    description: ' 0을 입력하면 수입 (income) / 1을 입력하면 지출 (outcome)',
    example: 0,
  })
  type: number;

  @ApiPropertyOptional({ description: '메모', example: 'memo_1' })
  description: string;
}
