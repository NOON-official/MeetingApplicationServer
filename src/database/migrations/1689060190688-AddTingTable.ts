import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddTingTable1689060190688 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ting',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'tingCount',
            type: 'int',
          },
          {
            name: 'userId',
            type: 'int',
          },
          {
            name: 'createdAt',
            type: 'timestamp(6)',
            default: 'CURRENT_TIMESTAMP(6)',
          },
          {
            name: 'updatedAt',
            type: 'timestamp(6)',
            default: 'CURRENT_TIMESTAMP(6)',
          },
          {
            name: 'deletedAt',
            type: 'timestamp(6)',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'ting',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE ting');
  }
}
