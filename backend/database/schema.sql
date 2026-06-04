CREATE DATABASE IF NOT EXISTS code_judge_mvp;
USE code_judge_mvp;

CREATE TABLE IF NOT EXISTS problems (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS testcases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  problem_id INT NOT NULL,
  input_data TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  CONSTRAINT fk_testcases_problem
    FOREIGN KEY (problem_id)
    REFERENCES problems(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
