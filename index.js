// Imports and requires the inquirer
const inquirer = require("inquirer");

// Imports and requires mysql2 npm package
const mysql = require("mysql2");

// Imports and requires console.table npm package
const consoleTable = require("console.table");

// Imports and requires the promise mysql npm package
const promise = require("promise-mysql");

// Establishes the connection with the database by using the specified information
const databaseConnection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "0000",
  database: "employees_database",
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
function promptInitiate() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "What would you like to do?",
        name: "choice",
        choices: [
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
}

//
function viewAllEmployees() {
  databaseConnection.query(
    "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(e.first_name, ' ' ,e.last_name) AS manager FROM employee INNER JOIN role on role.id = employee.role_id INNER JOIN department on department.id = role.department_id left join employee e on employee.manager_id = e.id;",
    (err, table) => {
      if (err) {
        console.log(err);
      }
      console.table(table);
      promptInitiate();
    }
  );
}

// Adds a new employee to the database
function addEmployee() {
  let roleArray = [];
  let managerArray = [];

  databaseConnection.query("SELECT * FROM role", (err, results) => {
    if (err) {
      console.log(err);
    }
    return results.map(role => roleArray.push(`${role.title}`));
  });

  databaseConnection.query(
    "SELECT first_name, last_name FROM employee WHERE manager_id IS NULL",
    (err, results) => {
      if (err) {
        console.log(err);
      }

      results.map(manager => {
        managerArray.push(`${manager.first_name} ${manager.last_name}`);
      });
      return managerArray;
    }
  );

  inquirer
    .prompt([
      {
        type: "input",
        message: "What id the employee's first name?",
        name: "first_name",
      },
      {
        type: "input",
        message: "What is the employee's last name?",
        name: "last_name",
      },
      {
        type: "rawlist",
        message: "What is the employee role?",
        name: "role",
        choices: roleArray,
      },
      {
        name: "manager",
        type: "rawlist",
        message: "What is there manager name?",
        choices: managerArray,
      },
    ])
    .then(answer => {
      const role_id = roleArray.indexOf(answer.role) + 1;

      const manager_id = managerArray.indexOf(answer.manager) + 1;

      const newEmployee = {
        first_name: answer.first_name,
        last_name: answer.last_name,
        manager_id: manager_id,
        role_id,
      };

      databaseConnection.query(
        "INSERT INTO employee SET ?",
        newEmployee,
        err => {
          if (err) {
            console.log(err);
          }

          promptInitiate();
        }
      );
    });
}

// function getEmployeeNames () {
//   const employeeNames = [];
//   results.map(employee =>
//     employeeNames.push(`${employee.first_name} ${employee.last_name}`)
//   );
//   return employeeNames;
// }

// databaseConnection.query(
//   "SELECT employee.firstName, employee.last_name, role.title FROM employee JOIN role ON employee.role_id = role.id;",
//   (err, results) => {
//     if (err) {
//       console.log(err);
//     }

function updateEmployeeRole() {
  let employeeArray = [];
  let roleArray = [];
  
  databaseConnection.query("SELECT * FROM role", (err, results) => {
    if (err) {
      console.log(err);
    }
    return results.map(role => roleArray.push(`${role.title}`));
  });

  


  inquirer.prompt([
    {
      name: "employeeName",
      type: "rawlist",
      choices: getEmployeeNames(),
      message: "Which employee's role do you want to update?",
    },
    {
      name: "role",
      type: "rawlist",
      message: "What is the employee's new title",
      choices: selectRole(),
    },
  ]);
}
