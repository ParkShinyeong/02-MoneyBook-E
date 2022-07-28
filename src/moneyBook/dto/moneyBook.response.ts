import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from 'src/common/baseResponse.dto';
import { MoneyBook } from '../entities/moneyBook.entity';

/* 
    작성자 : 염하늘
      - response template 작성
  */

export abstract class DefaultResponseData {
  @ApiProperty()
  moneybook: MoneyBook;
}

export class DefaultResponse extends BaseResponse {
  constructor() {
    super();
  }

  @ApiProperty()
  data: DefaultResponseData;

  public static response(data: any, statusCode?: number, message?: string) {
    const response = new DefaultResponse();
    response.data = data;
    response.message = message;
    response.statusCode = statusCode || 200;

    return response;
  }
}
