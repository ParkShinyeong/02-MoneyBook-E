/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('moneybook')
export class MoneyBook {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  // income or outcome
  @ApiProperty()
  @Column()
  money: number;

  @ApiProperty()
  @Column()
  type: string;

  // 총 합계
  @ApiProperty()
  @Column()
  total: number;

  @ApiProperty()
  @Column()
  description: string;

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedAt: Date;

  @ApiProperty()
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => User, (user) => user.moneyBooks, {
    // nullable: true,
    createForeignKeyConstraints: false,
  })
  user: User;
}
