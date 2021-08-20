// Imports and requires the inquirer
const inquirer = require("inquirer");

// Imports and requires mysql2 npm package
const mysql = require("mysql2");

// Imports and requires console.table npm package
const consoleTable = require("console.table");

// Establishes the connection with the database by using the specified information
const databaseConnection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "0000",
  database: "employee_database",
});

// Checks if the database connection failed or gave an error
// If not logs that connection established and calls for the prompt function
databaseConnection.connect(err => {
  if (err) {
    console.log(err);
  }
  console.log("Database connection established");
  promptInitiate();
});

// Initialize the prompts and collects the users input
const promptInitiate = () => {
  inquirer
    .prompt([
      {
        type: "list",
        message: "What would you like to do?",
        name: "choise",
        choice: [
          "View All Employees?",
          "Add Employee?",
          "Update Employee Role",
          "View All Roles?",
          "Add Role?",
          "View all Departments",
          "Add Department?",
        ],
      },
    ])
    .then(answer => {
    // Checks if the user choice matches the case then calls the appropriate function
      switch (answer.choice) {
        case "View All Employees?":
          viewAllEmployees();
          break;
        case "Add Employee?":
          addEmployee();
          break;
          case "Update Employee Role":
            updateEmployeeRole();
            break;
        case "View All Roles?":
          viewAllRoles();
          break;
          case "Add Role?":
            addRole();
            break;
        case "View all Departments":
          viewAllDepartments();
          break;
        case "Add Department?":
          addDepartment();
          break;
      }
    });
};
