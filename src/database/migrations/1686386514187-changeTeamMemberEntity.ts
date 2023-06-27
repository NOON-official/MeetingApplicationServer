import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class changeTeamMemberEntity1686386514187 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('team_member',
            new TableColumn({
                name: 'university',
                type: 'int',
            }),
        );
        await queryRunner.changeColumn('team_member','mbti',
            new TableColumn({
                name: 'mbti',
                type: 'int',
                default:17
            })
        );
        await queryRunner.addColumn('team',
            new TableColumn({
                name: 'kakaoId',
                type:'text'
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
