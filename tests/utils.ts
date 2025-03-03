/* eslint-disable @typescript-eslint/no-floating-promises */

import type { Express } from "express";
import type { Server } from "http";
import type { Test } from "supertest";
import type { InferAttributes, CreationAttributes, Model, Sequelize } from "sequelize";

import { setUpAssociations } from "../src/associations";
import { Educator, StudentsClasses, initializeModels } from "../src/models";
import { createApp } from "../src/server";
import { Class, Student } from "../src/models";
import { APIKey } from "../src/models/api_key";
import { config } from "dotenv";
import { v4 } from "uuid";
import { getDatabaseConnection } from "../src/database";
import { createConnection, Connection } from "mysql2/promise";
import { hashAPIKey } from "../src/authorization";

export function authorize(request: Test): Test {
  return request.set({ Authorization: process.env.CDS_API_KEY });
}

export async function createTestMySQLConnection(): Promise<Connection> {
  return createConnection({
    host: process.env.DB_TEST_HOSTNAME as string,
    user: process.env.DB_TEST_USERNAME as string,
    password: process.env.DB_TEST_PASSWORD as string,
  });
}

export async function getTestDatabaseConnection(): Promise<Sequelize> {
  const username = process.env.DB_TEST_USERNAME as string;
  const password = process.env.DB_TEST_PASSWORD as string;
  const host = process.env.DB_TEST_HOSTNAME as string;
  const db = getDatabaseConnection({
    dbName: "test", 
    username,
    password,
    host,
    logging: false,
  });

  await db.query("USE test;");
  initializeModels(db);
  setUpAssociations();

  return db;
}

export async function setupTestDatabase(): Promise<Sequelize> {
  config();
  const connection = await createTestMySQLConnection();
  await connection.query("CREATE DATABASE IF NOT EXISTS test;");
  const db = getTestDatabaseConnection();

  // We need to close when the connection terminates!
  // See https://github.com/sequelize/sequelize/issues/7953
  // and https://stackoverflow.com/a/45114507
  // db.sync({ force: true, match: /test/ }).finally(() => db.close());
  await syncTables(true);
  await addTestData();

  return db;
}

export async function teardownTestDatabase(): Promise<void> {
  const connection = await createTestMySQLConnection();
  await connection.query("DROP DATABASE test;");
}

export async function syncTables(force=false): Promise<void> {
  const options = { force };
  await APIKey.sync(options);
  await Student.sync(options);
  await Educator.sync(options);
  await Class.sync(options);
  await StudentsClasses.sync(options);
}

export async function addAPIKey(): Promise<APIKey | void> {
  // Set up some basic data that we're going to want
  const hashedKey = hashAPIKey(process.env.CDS_API_KEY as string);
  return APIKey.create({
    hashed_key: hashedKey,
    client: "Tests",
  });
}

export async function addTestData() {
  await addAPIKey();
}

export function createTestApp(db: Sequelize): Express {
  return createApp(db);
}

export function runApp(app: Express, port = 8080, callback?: () => void): Server {
  return app.listen(port, callback);
}

export async function randomStudent(options?: Partial<CreationAttributes<Student>>): Promise<Student> {
  const studentData: CreationAttributes<Student> = {
    email: v4(),
    username: v4(),
    password: v4(),
    verification_code: v4(),
    verified: 0,
    ...options,
  };
  return Student.create(studentData);
}

export async function randomEducator(options?: Partial<CreationAttributes<Educator>>): Promise<Educator> {
  const educatorData: CreationAttributes<Educator> = {
    first_name: v4(),
    last_name: v4(),
    password: v4(),
    email: v4(),
    verified: 1,
    verification_code: v4(),
    username: v4(),
    ...options,
  };
  return Educator.create(educatorData);
}

export async function randomClassForEducator(educatorID: number, options?: Partial<CreationAttributes<Class>>): Promise<Class> {
  const classData: CreationAttributes<Class> = {
    name: v4(),
    educator_id: educatorID,
    code: v4(),
    expected_size: 1,
    ...options,
  };
  return Class.create(classData);
}

export async function setupStudentInClasses() {
  const educator = await randomEducator(); 
  const class1 = await randomClassForEducator(educator.id);
  const class2 = await randomClassForEducator(educator.id);
  const student = await randomStudent();
  const sc1 = await StudentsClasses.create({
    student_id: student.id,
    class_id: class1.id,
  });
  const sc2 = await StudentsClasses.create({
    student_id: student.id,
    class_id: class2.id,
  });

  const cleanup = async () => {
    // Sometimes we want to remove the class-student associations during the test
    // In which case we can check whether it exists first
    (await StudentsClasses.findOne({ where: { student_id: student.id, class_id: class1.id } }))?.destroy();
    (await StudentsClasses.findOne({ where: { student_id: student.id, class_id: class2.id } }))?.destroy();
    await class1.destroy();
    await class2.destroy();
    await educator.destroy();
    await student.destroy();
  };

  return { student, educator, class1, class2, sc1, sc2, cleanup };
}

type ModelKey<T extends Model> = (keyof InferAttributes<T>)[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function expectToMatchModel<T extends Model>(object: any, expected: T, exclude: ModelKey<T>): void {
  const json: Partial<InferAttributes<T>> = expected.toJSON();
  exclude.forEach(key => delete json[key]);

  // We don't import this from @jest/globals because Jest will throw an error if we try to import a Jest global
  // outside of the testing environment
  // But the globals will still be available, so this works

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  expect(object).toMatchObject(json);
}
