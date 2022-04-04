-- INSERT INTO Students (Email, first_name, last_name, Password, Institution, Age, Gender, IP, ProfileCreated, LastVisit, Visits)
-- VALUES ('student1@school.com', 'Student', 'One', 'student1', 'School', 18, 'Male', '', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), 1)

INSERT INTO Educators (email, first_name, last_name, password, institution, age, gender, ip, visits)
VALUES ('teacher1@school.com', 'Teacher', 'One', 'teacher1', 'School', 18, 'Male', '',  1);

INSERT INTO Classes (educator_id, name)
VALUES (1, 'Class One', 'School');
