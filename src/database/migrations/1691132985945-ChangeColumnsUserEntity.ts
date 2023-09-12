import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ChangeColumnsUserEntity1691132985945 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'user',
      'isVerified',
      new TableColumn({
        name: 'isVerified',
        type: 'boolean',
        isNullable: false,
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'approval',
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
        isNullable: true,
      }),
    );

    await queryRunner.dropColumn('user', 'approval');
  }
}
