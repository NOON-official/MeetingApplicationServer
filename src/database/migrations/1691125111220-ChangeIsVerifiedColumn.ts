import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ChangeIsVerifiedColumn1691125111220 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'user',
      'isVerified',
      new TableColumn({
        name: 'isVerified',
        type: 'boolean',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'user',
      'isVerified',
      new TableColumn({
        name: 'isVerified',
        type: 'boolean',
      }),
    );
  }
}
