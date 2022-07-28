/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GetUser } from 'src/common/getUserDecorator';
import { MoneyBook } from 'src/moneyBook/entities/moneyBook.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateMoneyBookDto } from './dto/createMoneyBook.dto';
import { ModifyMoneyBookDto } from './dto/modifyMoneyBook.dto';
import { MoneyType } from './type/moneyBook.enum';

@Injectable()
export class MoneyBookService {
  /* 
    작성자 : 염하늘 / 김용민
      - CRRUD 로직 구현 (염하늘)
      - Restore 로직 구현 (김용민)
  */
  constructor(
    @InjectRepository(MoneyBook)
    private moneybookRepository: Repository<MoneyBook>,
  ) {}

  // 가계부 내역이 존재하는지 확인하고 존재하면 해당 정보를 불러옴.
  public async getMoneyBook(bookId: number, user: User) {

      const result = await this.moneybookRepository.
      createQueryBuilder('accountbook')
      .innerJoinAndSelect('accountbook.user',"user")
      .where('user.id = :userId', {userId : user.id})
      .andWhere('accountbook.id =:bookId',{bookId})
      .getOne()
      if (result) {
        return result;
      } else {
        throw new NotFoundException('존재하지 않는 내역입니다.');
    }
}
  // 로그인한 유저가 작성한 가계부 내역 중 가장 최신의 정보를 불러옴.
  public async latestMoneyBook(@GetUser() user: User) {
    const latestResult = await this.moneybookRepository.
    createQueryBuilder('accountbook')
    .innerJoinAndSelect('accountbook.user',"user")
    .where('user.id = :userId', {userId : user.id})
    .orderBy('accountbook.updatedAt','DESC')
    .orderBy('accountbook.createdAt','DESC')
    .limit(1)
    .getOne()
    if (latestResult) {
      return latestResult;
    }
  }

  // moneybook total 구하기
  public async accountTotal(
    user: User,
    dto: CreateMoneyBookDto | ModifyMoneyBookDto,
  ) {
    const type = dto.type == 0 ? MoneyType[0] : MoneyType[1];
    const currentMoney = dto.type == 0 ? dto.money : -dto.money;

    let newTotal = 0;
    const latestTotal = await this.latestMoneyBook(user);
    if (latestTotal) {
      newTotal = latestTotal.total + currentMoney;
      return { newTotal, type, currentMoney };
    } else {
      newTotal = currentMoney;
      return { newTotal, type, currentMoney };
    }
  }

  // 유저가 가계부를 생성함. 
  public async createMoneyBook(
    createDto: CreateMoneyBookDto,
    user: User,
  ): Promise<MoneyBook> {
    try {
      const moneyBook = new MoneyBook();
      moneyBook.description = createDto.description;
      moneyBook.user = user;

      const moneybookInfo = await this.accountTotal(user, createDto);
      moneyBook.total = moneybookInfo.newTotal;
      moneyBook.money = createDto.money;
      moneyBook.type = moneybookInfo.type;

      const createdMoneyBook = await this.moneybookRepository.save(moneyBook);
      return createdMoneyBook;
    } catch (error) {
      if (error) {
        throw new InternalServerErrorException();
      }
    }
  }
  // 유저가 작성한 가계부 목록 (내역) 최신 순으로 조회
  public async getAllMoneyBooks(user: User): Promise<MoneyBook[]> {
    try {
    const allMoneyBooks = await this.moneybookRepository.
    createQueryBuilder('accountbook')
    .innerJoinAndSelect('accountbook.user',"user")
    .where('user.id = :userId', {userId : user.id})
    .orderBy('accountbook.createdAt','DESC')
    .getMany()
    if (allMoneyBooks) {
      return allMoneyBooks;
    }  
  } catch (error) {
    if (error) {
      throw new InternalServerErrorException();
    }
}}

  // 유저가 작성한 가계부 상세 내역을 수정함.
  // 수정을 원하지 않을 경우 해당 key 값을 빼고 보냄.
  public async modifyMoneyBook(
    bookId: number,
    modifyDto: ModifyMoneyBookDto,
    user: User,
  ) {
      if (modifyDto.hasOwnProperty('type')) {
        await this.getMoneyBook(bookId, user);

        // 해당 유저가 작성한 가계부 내역 - 합계 존재하는지 확인
        const moneybookInfo = await this.accountTotal(user, modifyDto);
        const total = moneybookInfo.newTotal;
        const money = moneybookInfo.currentMoney;
        const type = moneybookInfo.type;

        await this.moneybookRepository
          .createQueryBuilder()
          .update(MoneyBook)
          .set({
            money,
            description: modifyDto.description,
            type,
            total,
          })
          .where('id = :id', { id: bookId })
          .execute();

        const newResult = await this.getMoneyBook(bookId, user);
        return newResult;
      } else {
        throw new BadRequestException(
          '수정할 내역이 올바르게 입력되지 않았습니다.',
        );
    }
  }

  // 유저가 작성한 가계부 상세 내역을 삭제함. (soft delete 처리하여 내역은 존재함.) 
  public async deleteMoneyBook(bookId: number, user: User) {
    try{
      const result = await this.getMoneyBook(bookId, user);
      if (result) {
        await this.moneybookRepository.softDelete({
          id: bookId,
        });
        return bookId;
      } 
    }catch(error){
      if (error){
        throw new NotFoundException('존재하지 않는 내역입니다.');
    } else {
      throw  new InternalServerErrorException()
    }
  }
}

  // 유저가 삭제한 가계부 내역을 복구함.
  public async restoreMoneyBook(
    bookId: number,
    user: User,
  ): Promise<any> {
      const accountBook =  await this.moneybookRepository.
      createQueryBuilder('accountbook')
      .withDeleted()
      .innerJoinAndSelect('accountbook.user',"user")
      .where('user.id = :userId', {userId : user.id})
      .andWhere('accountbook.id = :bookId', {bookId})
      .getOne()
       
      if (!accountBook) {
        throw new NotFoundException('존재하지 않는 내역입니다.');
      }
      if (accountBook.deletedAt === null) {
        throw new BadRequestException('삭제되지 않은 내역입니다.');
      }
     
      accountBook.deletedAt = null;
      await this.moneybookRepository.save(accountBook);
      return accountBook;
  }
}
