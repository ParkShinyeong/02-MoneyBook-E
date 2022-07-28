import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { MoneyBook } from './entities/moneyBook.entity';
import { MoneyBookController } from './moneyBook.controller';
import { MoneyBookService } from './moneyBook.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, MoneyBook]), ConfigModule],
  controllers: [MoneyBookController],
  providers: [MoneyBookService],
})
export class MoneyBooksModule {}
