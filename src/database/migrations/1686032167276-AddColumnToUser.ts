import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class AddColumnToUser1686032167276 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns('user',[
            new TableColumn({
                name: 'university',
                type: 'int',
                isNullable: true,
            }),
            new TableColumn({
                name: 'birth',
                type: 'int',
                isNullable: true,
            }),
        ])
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumns('user',[
            new TableColumn({
                name: 'university',
                type: 'number',
                isNullable: true,
            }),
            new TableColumn({
                name: 'birth',
                type: 'number',
                isNullable: true,
            }),
        ])
    }

}
