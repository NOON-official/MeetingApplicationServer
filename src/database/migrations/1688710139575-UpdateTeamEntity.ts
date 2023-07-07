import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class UpdateTeamEntity1688710139575 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn('team','teamAvailableDate', new TableColumn({
            name: 'teamAvailableDate',
            type: 'json'
        }));
        await queryRunner.changeColumn('team','kakaoId', new TableColumn({
            name: 'kakaoId',
            type: 'text',
            isNullable: true
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn('team','teamAvailableDate', new TableColumn({
            name: 'teamAvailableDate',
            type: 'int',
            default: 3,
        }));
        await queryRunner.changeColumn('team','kakaoId', new TableColumn({
            name: 'kakaoId',
            type: 'text'
        }));
    }

}
