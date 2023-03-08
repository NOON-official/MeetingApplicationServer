import { config } from 'dotenv';
config({
  path:
    process.env.NODE_ENV === 'production'
      ? __dirname + '/../../.env.production'
      : __dirname + '/../../.env.development',
});
import { DataSource } from 'typeorm';

export const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT, // Number
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['dist/**/**/*.entity.js'],
  synchronize: process.env.DB_SYNCHRONIZE === 'true' ? true : false,
  timezone: 'Z',
  migrations: ['dist/database/migrations/*.js'],
});
