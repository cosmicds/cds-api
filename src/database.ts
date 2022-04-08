import { Model, Op, Sequelize } from 'sequelize';
import { Class, initializeClassModel } from './models/class';
import { Educator, initializeEducatorModel } from './models/educator';
import { Student, initializeStudentModel } from './models/student';
import { StudentsClasses, initializeStudentClassModel } from './models/student_class';
import { HubbleMeasurement, initializeHubbleMeasurementModel } from './models/hubble_measurement';
import { enc, SHA256 } from 'crypto-js';
import { randomString } from './utils';
import { v5 } from 'uuid';

import {
  CreateClassResult,
  LoginResult,
  SignUpResult,
  VerificationResult,
  SubmitHubbleMeasurementResult
} from './request_results';

import { User } from './user';
import { Galaxy, initializeGalaxyModel } from './models/galaxy';
import { initializeStoryStateModel, StoryState } from './models/story_state';

type SequelizeError = { parent: { code: string } };

export type LoginResponse = {
  result: LoginResult;
  id?: number;
  valid: boolean;
};

export type CreateClassResponse = {
  result: CreateClassResult;
  class?: object;
}

// A namespace for creating v5 UUIDs
const cdsNamespace = "0a69782c-f1af-48c5-9aaf-078a4e511518";
function createV5(name: string): string {
  return v5(name, cdsNamespace);
}

export const cosmicdsDB = new Sequelize('cosmicds_db', 'cdsadmin', '5S4R1qCxzQg0', {
    host: "cosmicds-db.cupwuw3jvfpc.us-east-1.rds.amazonaws.com",
    dialect: 'mysql',
    define: {
      timestamps: false
    }
});

// export const cosmicdsDB = new Sequelize('cosmicds_db', 'jon', 'Testp@ss123', {
//   host: 'localhost',
//   dialect: 'mysql',
//   define: {
//     timestamps: false
//   }
// });

console.log(cosmicdsDB);

// Initialize our models with our database connection
initializeEducatorModel(cosmicdsDB);
initializeStudentModel(cosmicdsDB);
initializeClassModel(cosmicdsDB);
initializeStudentClassModel(cosmicdsDB);
initializeGalaxyModel(cosmicdsDB);
initializeHubbleMeasurementModel(cosmicdsDB);
initializeStoryStateModel(cosmicdsDB);
 
// // Synchronize models with the database
// (async () => {
//   const createIfExistsOptions = {};
//   //const alterOptions = { alter: true };
//   const syncOptions = createIfExistsOptions;
//   await Educator.sync(syncOptions).catch(console.log);
//   await Student.sync(syncOptions).catch(console.log);
//   await Class.sync(syncOptions).catch(console.log);
//   await StudentsClasses.sync(syncOptions).catch(console.log);
// })();


function encryptPassword(password: string): string {
  return SHA256(password).toString(enc.Base64);
}

// For now, this just distinguishes between duplicate account creation and other errors
// We can flesh this out layer
function signupResultFromError(error: SequelizeError): SignUpResult {
  const code = error.parent.code;
  switch (code) {
    case 'ER_DUP_ENTRY':
      return SignUpResult.EmailExists;
    default:
      return SignUpResult.Error;
  }
}

function createClassResultFromError(error: SequelizeError): CreateClassResult {
  const code = error.parent.code;
  switch (code) {
    case 'ER_DUP_ENTRY':
      return CreateClassResult.AlreadyExists;
    default:
      return CreateClassResult.Error;
  }
}

async function educatorWithEmail(email: string): Promise<Educator | null> {
  const result = await Educator.findAll({
    where: { email: { [Op.like] : email } }
  });
  return result.length > 0 ? result[0] : null;
}

async function studentWithEmail(email: string): Promise<Student | null> {
  const result = await Student.findAll({
    where: { email: { [Op.like] : email } }
  });
  return result.length > 0 ? result[0] : null;
}

export async function verifyStudent(verificationCode: string): Promise<VerificationResult> {
  const result = await Student.findAll({
    where: {
      verification_code: verificationCode
    }
  });
  if (result.length > 0) {
    const student = result[0];
    if (student.verified === 1) {
      return VerificationResult.AlreadyVerified;
    }
    student.update({ verified: 1 }, {
      where: { id: student.id }
    });
    return VerificationResult.Ok;
  }
  return VerificationResult.InvalidCode;
}

export async function verifyEducator(verificationCode: string): Promise<VerificationResult> {
  const result = await Educator.findAll({
    where: {
      verification_code: verificationCode
    }
  });
  if (result.length > 0) {
    const educator = result[0];
    if (educator.verified === 1) {
      return VerificationResult.AlreadyVerified;
    }
    educator.update({ verified: 1 }, {
      where: { id: educator.id }
    });
    return VerificationResult.Ok;
  }
  return VerificationResult.InvalidCode;
}

async function studentVerificationCodeExists(code: string): Promise<boolean> {
  const result = await Student.findAll({
    where: { verification_code: code }
  });
  return result.length > 0;
}

async function educatorVerificationCodeExists(code: string): Promise<boolean> {
  const result = await Educator.findAll({
    where: { verification_code: code }
  });
  return result.length > 0;
}

export async function signUpEducator(firstName: string, lastName: string,
                              password: string, institution: string | null,
                              email: string, age: number | null, gender: string): Promise<SignUpResult> {
                         
  const encryptedPassword = encryptPassword(password);

  let validCode;
  let verificationCode: string;
  do {
    verificationCode = randomString();
    validCode = !(await educatorVerificationCodeExists(verificationCode) || await studentVerificationCodeExists(verificationCode));
  } while (!validCode);

  let result = SignUpResult.Ok;
  await Educator.create({
      first_name: firstName,
      last_name: lastName,
      verified: 0,
      verification_code: verificationCode,
      password: encryptedPassword,
      institution: institution,
      email: email,
      age: age,
      gender: gender,
    })
    .catch(error => {
      result = signupResultFromError(error);
    });
    return result;
}

export async function signUpStudent(username: string,
                             password: string, institution: string | null,
                             email: string, age: number, gender: string): Promise<SignUpResult> {
  
  const encryptedPassword = encryptPassword(password);

  let validCode;
  let verificationCode: string;
  do {
    verificationCode = randomString();
    validCode = !(await educatorVerificationCodeExists(verificationCode) || await studentVerificationCodeExists(verificationCode));
  } while (!validCode);
  
  let result = SignUpResult.Ok;
  await Student.create({
    username: username,
    verified: 0,
    verification_code: randomString(),
    password: encryptedPassword,
    institution: institution,
    email: email,
    age: age,
    gender: gender,
  })
  .catch(error => {
    result = signupResultFromError(error);
  });
  return result;
}

export async function createClass(educatorID: number, name: string): Promise<CreateClassResponse> {
  
  let result = CreateClassResult.Ok;
  const nameString = `${educatorID}_${name}`;
  const code = createV5(nameString);
  const creationInfo = {
    educator_id: educatorID,
    name: name,
    code: code,
  }
  await Class.create(creationInfo)
  .catch(error => {
    result = createClassResultFromError(error);
  });

  let info = result === CreateClassResult.Ok ? creationInfo : undefined;
  return { result: result, class: info };
}

export async function addStudentToClass(studentID: number, classID: number): Promise<StudentsClasses> {
  return StudentsClasses.create({
    student_id: studentID,
    class_id: classID
  });
}

async function checkLogin<T extends Model & User>(email: string, password: string, emailFinder: (email: string)
  => Promise<T | null>): Promise<LoginResponse> {

  const encryptedPassword = encryptPassword(password);
  const user = await emailFinder(email);
  if (user === null) {
    return { result: LoginResult.EmailNotExist, valid: false };
  }
  if (user.password !== encryptedPassword) {
    return { result: LoginResult.IncorrectPassword, valid: false };
  }
  if (user.verified !== 1) {
    return { result: LoginResult.NotVerified, valid: false };
  }
  user.update({
    visits: user.visits + 1,
    last_visit: Date.now()
  }, {
    where: { id: user.id }
  });
  return {result: LoginResult.Ok, id: user.id, valid: true };
}

export async function checkStudentLogin(email: string, password: string): Promise<LoginResponse> {
  return checkLogin(email, password, studentWithEmail);
}

export async function checkEducatorLogin(email: string, password: string): Promise<LoginResponse> {
  return checkLogin(email, password, educatorWithEmail);
}

export async function submitHubbleMeasurement(data: {
  student_id: number,
  galaxy_id: number,
  rest_wave_value: number | null,
  rest_wave_unit: string | null,
  obs_wave_value: number | null,
  obs_wave_unit: string | null,
  velocity_value: number | null,
  velocity_unit: string | null,
  ang_size_value: number | null,
  ang_size_unit: string | null,
  est_dist_value: number | null,
  est_dist_init: string | null
}): Promise<SubmitHubbleMeasurementResult> {

  const measurement = await HubbleMeasurement.findOne({
    where: {
      [Op.and]: [
        { student_id: data.student_id },
        { galaxy_id: data.galaxy_id }
      ]
    }
  })
  .catch(console.log);

  if (measurement) {
    data
    measurement.update(data, {
      where: {
        [Op.and]: [
          { student_id: measurement.student_id },
          { galaxy_id: measurement.galaxy_id }
        ]
      }
    })
    .catch(console.log);
    return SubmitHubbleMeasurementResult.MeasurementUpdated;
  } else {
    HubbleMeasurement.create(data).catch(console.log);
    return SubmitHubbleMeasurementResult.MeasurementCreated;
  }
}

export async function getHubbleMeasurement(studentID: number, galaxyID: number): Promise<HubbleMeasurement | null> {
  return HubbleMeasurement.findOne({
    where: {
      [Op.and]: [
        { student_id: studentID },
        { galaxy_id: galaxyID }
      ]
    }
  });
}

export async function getStudentHubbleMeasurements(studentID: number): Promise<HubbleMeasurement[] | null> {
  const result = await HubbleMeasurement.findAll({
  where: {
      student_id: studentID
    }
  })
  .catch(error => {
    console.log(error);
    return null;
  });
  return result;
}

export async function getAllGalaxies(): Promise<Galaxy[]> {
  return Galaxy.findAll();
}

export async function getAllStudents(): Promise<Student[]> {
  return Student.findAll();
}

export async function getAllEducators(): Promise<Educator[]> {
  return Educator.findAll();
}

export async function getStoryState(studentID: number, storyName: string): Promise<JSON | null> {
  const result = await StoryState.findAll({
    where: {
      student_id: studentID,
      story_name: storyName
    }
  })
  .catch(error => {
    console.log(error);
    return null;
  });
  if (result === null || result.length !== 1) {
    return null;
  }
  return result[0].story_state;
}

export async function getClassesForEducator(educatorID: number): Promise<Class[]> {
  return Class.findAll({
    where: {
      educator_id: educatorID
    }
  });
}

export async function deleteClass(id: number): Promise<number> {
  return Class.destroy({
    where: {
      id: id
    }
  });
}
