import { User } from 'src/users/entities/user.entity';
import { CreateAgreementDto } from './../dtos/create-agreement.dto';
import { UserAgreement } from './../entities/user-agreement.entity';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Repository } from 'typeorm';

@CustomRepository(UserAgreement)
export class UserAgreementsRepository extends Repository<UserAgreement> {
  async getAgreementByUserId(userId: number): Promise<UserAgreement> {
    const userAgreement = await this.createQueryBuilder('user_agreement')
      .where('user_agreement.userId = :userId', { userId })
      .getOne();

    return userAgreement;
  }

  async createAgreement(user: User, createAgreementDto: CreateAgreementDto): Promise<void> {
    const userAgreement = this.create({ ...createAgreementDto, user });

    await this.save(userAgreement);
  }
}
