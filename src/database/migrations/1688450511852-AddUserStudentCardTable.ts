import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddUserStudentCardTable1688450511852 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_student_card',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'userId',
            type: 'int',
          },
          {
            name: 'studentCardUrl',
            type: 'text',
          },
          {
            name: 'createdAt',
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
      'user_student_card',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE user_student_card');
  }
}
