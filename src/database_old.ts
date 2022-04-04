// @ts-nocheck

const mysql = require("mysql");
const cryptoJS = require("crypto-js");

const converters = require('./utils/converters.js');

function encryptPassword(password) {
  return cryptoJS.SHA256(password).toString(cryptoJS.enc.Base64);
}

async function executeSqlTransaction(conn, commands, valueLists) {

  const cmdsAndVals = commands.map((e, i) => [e, valueLists[i]]);
  return new Promise(function(resolve, reject) {
    conn.beginTransaction(function(err) {
      if (err) { reject(err); }
      cmdsAndVals.forEach(async ([command, values]) => {
        await executeSqlQuery(conn, command, values)
          .catch(error => {
            conn.rollback();
            console.log(error);
            reject(error);
          });
      });
      conn.commit(function(error, results) {
        if (error) {
          conn.rollback();
          console.log(error);
          reject(err);
        }
        resolve(results);
      });
    });
  })
}

async function executeSqlQuery(conn, sql, values) {
  return new Promise(function(resolve, reject) {
    const params = values || [];
    conn.query(sql, params, function(error, result) {
      if (error) {
        return reject(error); 
      }
      resolve(result);
    });
  });
}

async function educatorEmailExists(conn, email) {
  const query = "SELECT COUNT(ID) AS num FROM Educators WHERE Email LIKE ?";
  const result = await executeSqlQuery(conn, query, [email]);
  return result[0].num >= 1;
}

async function signUpEducator(conn, data) {
  const firstName = data.firstName;
  const lastName = data.lastName;
  const password = data.password;
  const institution = data.institution;
  const email = data.email;
  const age = data.age;
  const gender = data.gender;
  const datetime = converters.dateToMySQLDateTime(new Date());

  const emailAlreadyExists = await educatorEmailExists(conn, email);
  if (emailAlreadyExists) {
    console.log("Email already exists");
    return 1;
  }

  // Encode the password
  const encryptedPW = encryptPassword(password);

  const sql = `INSERT INTO Educators (Email, FirstName, LastName, Password, Institution, Age, Gender, IP, ProfileCreated, LastVisit, Visits) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [email, firstName, lastName, encryptedPW, institution, age, gender, '', datetime, datetime, 1];
  const result = await executeSqlQuery(conn, sql, values);
  const affectedRows = result.affectedRows;
  return affectedRows === 1 ? 0 : 2;
}

async function studentEmailExists(conn, email) {
  const query = "SELECT COUNT(*) AS num FROM Students WHERE Email LIKE ?";
  const result = await executeSqlQuery(conn, query, [email]);
  return result[0].num >= 1;
}

async function signUpStudent(conn, data) {
  const firstName = data.firstName;
  const lastName = data.lastName;
  const password = data.password;
  const institution = data.institution;
  const email = data.email;
  const age = data.age;
  const gender = data.gender;
  const datetime = converters.dateToMySQLDateTime(new Date());

  const emailAlreadyExists = await studentEmailExists(conn, email);
  if (emailAlreadyExists) {
    console.log("Email already exists");
    return 1;
  }

  // Encrypt the password
  const encPW = encryptPassword(password);

  const sql = `INSERT INTO Students (Email, FirstName, LastName, Password, Institution, Age, Gender, IP, ProfileCreated, LastVisit, Visits) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [email, firstName, lastName, encPW, institution, age, gender, '', datetime, datetime, 1];
  const result = await executeSqlQuery(conn, sql, values);
  const affectedRows = result.affectedRows;
  return affectedRows === 1 ? 0 : 2;
}

async function createClass(conn, data) {
  const sql = 'INSERT INTO Classes (Educator_ID, Name, Institution) VALUES (?, ?, ?)';
  const values = [data.educatorID, data.name, data.institution];
  const result = await executeSqlQuery(conn, sql, values);
  const affectedRows = result.affectedRows;
  return affectedRows === 1 ? 0 : 1;
}

async function checkLogin(conn, data, table) {
  const encryptedPW = encryptPassword(data.password);
  console.log(encryptedPW);
  const sql = `SELECT COUNT(*) AS num FROM ${table} WHERE Email LIKE ? AND Password LIKE ?"`
  const values = [data.email, encryptedPW];
  const result = await executeSqlQuery(conn, sql, values);
  return result[0].num > 0;
}

async function checkStudentLogin(conn, data) {
  return checkLogin(conn, data, "Students");
}

async function checkEducatorLogin(conn, data) {
  return checkLogin(conn, data, "Educators");
}

async function addStudentToClass(conn, data) {
  const datetime = converters.dateToMySQLDateTime(new Date());
  
  const sql = "INSERT INTO StudentsClasses (Student_ID, Class_ID, Joined) VALUES (?, ?, ?)";
  const values = [data.studentID, data.classID, datetime];
  const result = await executeSqlQuery(conn, sql, values)
    .catch(err => {
      console.log(err);
      return 2;
    });
  const affectedRows = result.affectedRows;
  return affectedRows === 1 ? 0 : 1;
}

async function insertRecords(conn, table, columns, records) {
  const columnsString = columns.join(", ");
  const paramsString = Array(columns.length).fill("?").join(", ");
  const command = `INSERT INTO ${table} (${columnsString}) VALUES (${paramsString})`;
  const commands = Array(records.length).fill(command);
  const valueLists = records.map(record => columns.map(column => rec[column]));
  const result = await executeSqlTransaction(conn, commands, valueLists);
  return result ? 0 : 1;
}

function cosmicDSConnection() {
  return mysql.createConnection({
    host: "cosmicds-db.cupwuw3jvfpc.us-east-1.rds.amazonaws.com",
    user: "cdsadmin",
    password: "5S4R1qCxzQg0",
    database: "cosmicds_db"
  });
}

// const cnx = cosmicDSConnection();
// const d = { studentID: 1, classID: 1 };
// addStudentToClass(cnx, d);


module.exports = {
  checkStudentLogin,
  checkEducatorLogin,
  createClass,
  cosmicDSConnection,
  signUpEducator,
  signUpStudent
};
