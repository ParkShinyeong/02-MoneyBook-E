import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { classToPlain } from 'class-transformer';

import { User } from 'src/user/entities/user.entity';

import { DataSource, QueryBuilder, Repository } from 'typeorm';
import { CreateMoneyBookDto } from '../dto/createMoneyBook.dto';
import { ModifyMoneyBookDto } from '../dto/modifyMoneyBook.dto';
import { MoneyBook } from '../entities/moneyBook.entity';
import { MoneyBookService } from '../moneyBook.service';

/* 
    작성자 : 김태영
      - moneyBook.service 유닛 테스트 파일 작성
  */

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn().mockReturnThis(),
  softDelete: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    delete: jest.fn().mockReturnThis(),
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    execute: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    withDeleted: jest.fn().mockReturnThis(),
  }),
});

describe('MoneyBookService', () => {
  let moneyBookService: MoneyBookService;
  let moneyBookRepository: MockRepository<MoneyBook>;
  let dataSource: DataSource;

  const qb = {
    connection: {},
  } as QueryBuilder<MoneyBook>;

  class MockDataSource {
    createQueryBuilder(): QueryBuilder<MoneyBook> {
      return qb;
    }
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MoneyBookService,
        { provide: 'MoneyBookRepository', useFactory: mockRepository },
        { provide: DataSource, useClass: MockDataSource },
      ],
    }).compile();

    moneyBookService = module.get<MoneyBookService>(MoneyBookService);
    moneyBookRepository = module.get(
      'MoneyBookRepository',
    ) as MockRepository<MoneyBook>;
    dataSource = module.get<DataSource>(DataSource);
  });

  it('기본 테스트', () => {
    expect(moneyBookService).toBeDefined();
  });

  let bookId;
  let user: User;
  let moneyBook: MoneyBook;
  let createIncomeDto: CreateMoneyBookDto;
  let createOutcomeDto: CreateMoneyBookDto;
  beforeEach(() => {
    bookId = 1;
    user = {
      id: 1,
      email: 'team01@naver.com',
      password: '1234abcd',
      createdAt: new Date(),
      updatedAt: new Date(),
      hashedRefreshToken: 'string',
      moneyBooks: [],
      toJSON() {
        return classToPlain(this);
      },
    };

    moneyBook = {
      id: 1,
      money: 3000,
      type: 'outcome',
      description: '콜라 구매',
      total: 10000,
      createdAt: new Date('2022-07-06T14:49:09.929Z'),
      updatedAt: new Date('2022-07-06T14:49:09.929Z'),
      deletedAt: null,
      user,
    };

    createIncomeDto = {
      money: 1000,
      type: 0,
      description: 'memo_1',
    };

    createOutcomeDto = {
      money: 1000,
      type: 1,
      description: 'memo_2',
    };
  });

  describe('getMoneyBook', () => {
    it('기본 테스트', () => {
      expect(moneyBookService.getMoneyBook).toBeDefined();
    });

    it('쿼리빌더 콜타임 카운팅', async () => {
      await moneyBookService.getMoneyBook(bookId, user);

      expect(moneyBookRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(
        moneyBookRepository.createQueryBuilder().innerJoinAndSelect,
      ).toHaveBeenCalledTimes(1);
      expect(
        moneyBookRepository.createQueryBuilder().where,
      ).toHaveBeenCalledTimes(1);
      expect(
        moneyBookRepository.createQueryBuilder().andWhere,
      ).toHaveBeenCalledTimes(1);

      expect(
        moneyBookRepository.createQueryBuilder().getOne,
      ).toHaveBeenCalledTimes(1);
    });
    it('결과값 검증', async () => {
      jest
        .spyOn(moneyBookRepository.createQueryBuilder(), 'getOne')
        .mockResolvedValue(moneyBook);
      const result = await moneyBookService.getMoneyBook(bookId, user);

      expect(
        moneyBookRepository.createQueryBuilder().getOne,
      ).toHaveBeenCalled();

      expect(result).toEqual(moneyBook);
    });
    it('조회값이 없을 시 404 에러', async () => {
      moneyBookRepository
        .createQueryBuilder()
        .getOne.mockResolvedValue(undefined);
      try {
        await moneyBookService.getMoneyBook(bookId, user);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('존재하지 않는 내역입니다.');
      }
    });
  });

  describe('latestMoneyBook', () => {
    it('기본 테스트', async () => {
      expect(moneyBookService.latestMoneyBook).toBeDefined();
    });
    it('쿼리빌더 콜타임 카운팅', async () => {
      await moneyBookService.latestMoneyBook(user);

      expect(moneyBookRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(
        moneyBookRepository.createQueryBuilder().innerJoinAndSelect,
      ).toHaveBeenCalledTimes(1);
      expect(
        moneyBookRepository.createQueryBuilder().where,
      ).toHaveBeenCalledTimes(1);
      expect(
        moneyBookRepository.createQueryBuilder().orderBy,
      ).toHaveBeenCalledTimes(2);
      expect(
        moneyBookRepository.createQueryBuilder().limit,
      ).toHaveBeenCalledTimes(1);
      expect(
        moneyBookRepository.createQueryBuilder().getOne,
      ).toHaveBeenCalledTimes(1);
    });

    it('결과값 검증', async () => {
      jest
        .spyOn(moneyBookRepository.createQueryBuilder(), 'getOne')
        .mockResolvedValue(moneyBook);
      const result = await moneyBookService.latestMoneyBook(user);

      expect(
        moneyBookRepository.createQueryBuilder().getOne,
      ).toHaveBeenCalled();

      expect(result).toEqual(moneyBook);
    });

    it('결과값 없을 시', async () => {
      jest
        .spyOn(moneyBookRepository.createQueryBuilder(), 'getOne')
        .mockResolvedValue(undefined);
      const result = await moneyBookService.latestMoneyBook(user);
      expect(
        moneyBookRepository.createQueryBuilder().getOne,
      ).toHaveBeenCalled();
      expect(result).toEqual(undefined);
    });
  });

  describe('accountTotal', () => {
    let dto: CreateMoneyBookDto;
    beforeEach(() => {
      dto = createIncomeDto;
    });
    it('기본 테스트', async () => {
      expect(moneyBookService.accountTotal).toBeDefined();
    });

    it('결과값 검증 : 수입', async () => {
      dto = createIncomeDto;
      const incomeMoney = {
        newTotal: 11000,
        type: 'income',
        currentMoney: 1000,
      };
      jest
        .spyOn(moneyBookService, 'latestMoneyBook')
        .mockResolvedValue(moneyBook);
      const result = await moneyBookService.accountTotal(user, dto);
      expect(result).toEqual(incomeMoney);
    });
    it('결과값 검증 : 지출', async () => {
      dto = createOutcomeDto;
      const outcomeMoney = {
        newTotal: 9000,
        type: 'outcome',
        currentMoney: -1000,
      };
      jest
        .spyOn(moneyBookService, 'latestMoneyBook')
        .mockResolvedValue(moneyBook);
      const result = await moneyBookService.accountTotal(user, dto);
      expect(result).toEqual(outcomeMoney);
    });
  });

  describe('createMoneyBook', () => {
    let createDto: CreateMoneyBookDto;
    beforeEach(() => {
      createDto = createIncomeDto;
    });

    it('기본 테스트', async () => {
      expect(moneyBookService.accountTotal).toBeDefined();
      expect(moneyBookService.createMoneyBook).toBeDefined();
    });

    it('typeORM 콜타임 카운팅', async () => {
      await moneyBookService.createMoneyBook(createDto, user);
      expect(moneyBookRepository.save).toHaveBeenCalledTimes(1);
    });
    it('에러 테스트', async () => {
      try {
        await moneyBookService.createMoneyBook(null, null);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });
    it('결과값 검증 : 수입', async () => {
      createDto = createIncomeDto;
      const incomeMoney = {
        newTotal: 11000,
        type: 'income',
        currentMoney: 1000,
      };
      moneyBook.total = 11000;
      moneyBook.money = 1000;
      moneyBook.type = 'income';
      moneyBook.description = createDto.description;

      jest
        .spyOn(moneyBookService, 'accountTotal')
        .mockResolvedValue(incomeMoney);

      jest.spyOn(moneyBookRepository, 'save').mockResolvedValue(moneyBook);

      const result = await moneyBookService.createMoneyBook(createDto, user);
      expect(result).toEqual(moneyBook);
    });

    it('결과값 검증 : 지출', async () => {
      createDto = createIncomeDto;
      const outcomeMoney = {
        newTotal: 9000,
        type: 'outcome',
        currentMoney: -1000,
      };
      moneyBook.total = 9000;
      moneyBook.money = -1000;
      moneyBook.type = 'outcome';
      moneyBook.description = createDto.description;

      jest
        .spyOn(moneyBookService, 'accountTotal')
        .mockResolvedValue(outcomeMoney);

      jest.spyOn(moneyBookRepository, 'save').mockResolvedValue(moneyBook);

      const result = await moneyBookService.createMoneyBook(createDto, user);
      expect(result).toEqual(moneyBook);
    });
  });

  describe('getAllMoneyBooks', () => {
    it('기본 테스트', async () => {
      expect(moneyBookService.getAllMoneyBooks).toBeDefined();
    });
    it('기본 에러 테스트', async () => {
      try {
        await moneyBookService.getAllMoneyBooks(user);
        expect(moneyBookService.getAllMoneyBooks(user)).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });
    it('쿼리빌더 콜타임 카운팅', async () => {
      await moneyBookService.getAllMoneyBooks(user);
      expect(moneyBookRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(
        moneyBookRepository.createQueryBuilder().innerJoinAndSelect,
      ).toHaveBeenCalledTimes(1);
      expect(
        moneyBookRepository.createQueryBuilder().where,
      ).toHaveBeenCalledTimes(1);
      expect(
        moneyBookRepository.createQueryBuilder().orderBy,
      ).toHaveBeenCalledTimes(1);
      expect(
        moneyBookRepository.createQueryBuilder().getMany,
      ).toHaveBeenCalledTimes(1);
    });
    it('결과값 검증', async () => {
      jest
        .spyOn(moneyBookRepository.createQueryBuilder(), 'getMany')
        .mockResolvedValue([moneyBook]);

      const result = await moneyBookService.getAllMoneyBooks(user);

      expect(result).toEqual([moneyBook]);
    });
  });

  describe('modifyMoneyBook', () => {
    let modifyDto: ModifyMoneyBookDto;
    let accountTotal;
    let modifiedMoneyBook: MoneyBook;
    beforeEach(() => {
      modifyDto = {
        description: 'modified memo',
        money: 5000,
        type: 0,
      };
      accountTotal = {
        newTotal: 15000,
        type: 'income',
        currentMoney: 5000,
      };

      modifiedMoneyBook = {
        ...moneyBook,
        total: 15000,
        type: 'income',
        money: 5000,
        description: 'modified memo',
      };

      jest
        .spyOn(moneyBookService, 'accountTotal')
        .mockResolvedValue(accountTotal);
      jest
        .spyOn(moneyBookService, 'getMoneyBook')
        .mockResolvedValue(modifiedMoneyBook);
    });

    it('기본 테스트', async () => {
      expect(moneyBookService.modifyMoneyBook).toBeDefined();
    });

    it('400 에러 테스트', async () => {
      try {
        await moneyBookService.modifyMoneyBook(bookId, null, user);
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError);
        expect(error.message).toBe(
          "Cannot read properties of null (reading 'hasOwnProperty')",
        );
      }
    });
    it('쿼리빌더 콜타임 카운팅', async () => {
      moneyBook.description = modifyDto.description;

      await moneyBookService.modifyMoneyBook(bookId, modifyDto, user);

      expect(moneyBookRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(
        moneyBookRepository.createQueryBuilder().update,
      ).toHaveBeenCalledTimes(1);
      expect(
        moneyBookRepository.createQueryBuilder().set,
      ).toHaveBeenCalledTimes(1);
      expect(
        moneyBookRepository.createQueryBuilder().where,
      ).toHaveBeenCalledTimes(1);
      expect(
        moneyBookRepository.createQueryBuilder().execute,
      ).toHaveBeenCalledTimes(1);
    });

    it('결과값 검증', async () => {
      moneyBook.description = modifyDto.description;

      const result = await moneyBookService.modifyMoneyBook(
        bookId,
        modifyDto,
        user,
      );
      expect(result).toEqual(modifiedMoneyBook);
    });
  });

  describe('deleteMoneyBook', () => {
    it('기본 테스트', () => {
      expect(moneyBookService.deleteMoneyBook).toBeDefined();
    });

    it('에러 테스트', async () => {
      try {
        await moneyBookService.deleteMoneyBook(bookId, user);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('존재하지 않는 내역입니다.');
      }
    });

    it('결과값 검증', async () => {
      jest.spyOn(moneyBookService, 'getMoneyBook').mockResolvedValue(moneyBook);

      const result = await moneyBookService.deleteMoneyBook(bookId, user);
      expect(result).toEqual(bookId);
    });
  });

  describe('restoreMoneyBook', () => {
    let deletedBook;

    beforeEach(() => {
      deletedBook = moneyBook;
      deletedBook.deletedAt = new Date('2022-07-06T14:49:09.929Z');

      jest
        .spyOn(moneyBookRepository.createQueryBuilder(), 'getOne')
        .mockResolvedValue(deletedBook);
    });

    it('기본 테스트', () => {
      expect(moneyBookService.restoreMoneyBook).toBeDefined();
    });
    it('에러 테스트1', async () => {
      try {
        await moneyBookService.restoreMoneyBook(null, user);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('존재하지 않는 내역입니다.');
      }
    });
    it('에러 테스트2', async () => {
      try {
        jest
          .spyOn(moneyBookRepository.createQueryBuilder(), 'getOne')
          .mockResolvedValue(moneyBook);

        await moneyBookService.restoreMoneyBook(bookId, user);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('삭제되지 않은 내역입니다.');
      }
    });

    it('쿼리빌더 콜타임 카운팅', async () => {
      await moneyBookService.restoreMoneyBook(bookId, user);

      expect(moneyBookRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
      expect(
        moneyBookRepository.createQueryBuilder().innerJoinAndSelect,
      ).toHaveBeenCalledTimes(1);
      expect(
        moneyBookRepository.createQueryBuilder().withDeleted,
      ).toHaveBeenCalledTimes(1);
      expect(
        moneyBookRepository.createQueryBuilder().where,
      ).toHaveBeenCalledTimes(1);
      expect(
        moneyBookRepository.createQueryBuilder().andWhere,
      ).toHaveBeenCalledTimes(1);
      expect(
        moneyBookRepository.createQueryBuilder().getOne,
      ).toHaveBeenCalledTimes(1);
    });

    it('결과값 검증', async () => {
      jest.spyOn(moneyBookRepository, 'save').mockResolvedValue(moneyBook);

      await moneyBookService.restoreMoneyBook(bookId, user);
    });
  });
});
