// Imports and requires the inquirer
const inquirer = require("inquirer");

// Imports and requires mysql2 npm package
const mysql = require("mysql");

// Imports and requires console.table npm package
const consoleTable = require("console.table");

// Imports and requires the promise mysql npm package
const promiseSQL = require("promise-mysql");

const connectionProperties = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: "0000",
  database: "employees_database",
};

// Establishes the connection with the database by using the specified information
const databaseConnection = mysql.createConnection(connectionProperties);

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
          "Exit",
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
        case "Exit":
          databaseConnection.end();
          console.log("Bye");
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
        return managerArray.push(`${manager.first_name} ${manager.last_name}`);
      });
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
        "INSERT INTO employee SET ?;",
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

function updateEmployeeRole() {
  let employeeArray = [];
  let roleArray = [];

  promiseSQL
    .createConnection(connectionProperties)
    .then(conn => {
      return Promise.all([
        conn.query("SELECT id, title FROM role ORDER BY title ASC"),
        conn.query(
          "SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS Employee FROM employee ORDER BY Employee ASC"
        ),
      ]);
    })
    .then(([roles, employees]) => {
      roles.map(role => roleArray.push(role.title));

      employees.map(employee => employeeArray.push(employee.Employee));

      return Promise.all([roles, employees]);
    })
    .then(([roles, employees]) => {
      inquirer
        .prompt([
          {
            name: "employee",
            type: "list",
            choices: employeeArray,
            message: "Which employee's role do you want to update?",
          },
          {
            name: "role",
            type: "list",
            message: "Which role do you want to assign the selected employee?",
            choices: roleArray,
          },
        ])
        .then(answer => {
          let role_id;
          let employee_id;

          for (let i = 0; i < roles.length; i++) {
            if (answer.role == roles[i].title) {
              role_id = roles[i].id;
            }
          }

          for (let i = 0; i < employees.length; i++) {
            if (answer.employee == employees[i].Employee) {
              employee_id = employees[i].id;
            }
          }

          databaseConnection.query(
            `UPDATE employee SET role_id = ${role_id} WHERE id = ${employee_id}`,
            (err, res) => {
              if (err) {
                console.log(err);
              }
              promptInitiate();
            }
          );
        });
    });
}

function viewAllRoles() {
  databaseConnection.query(
    "SELECT role.id, role.title, role.salary FROM role;",
    (err, table) => {
      if (err) {
        console.log(err);
      }
      console.table(table);
      promptInitiate();
    }
  );
}

function addRole() {
  let departmentArray = [];

  promiseSQL
    .createConnection(connectionProperties)
    .then(conn => {
      return conn.query(
        "SELECT department.id, department.name FROM department;"
      );
    })
    .then(departments => {
      departments.map(department => departmentArray.push(department.name));
      return departments;
    })
    .then(departments => {
      inquirer
        .prompt([
          {
            name: "departmentRole",
            type: "input",
            message: "What is the name of the department?",
          },
          {
            name: "salary",
            type: "number",
            message: "What is the salary of the role?",
          },
          {
            name: "department",
            type: "list",
            message: "Which department does the role belong to?",
            choices: departmentArray,
          },
        ])
        .then(answer => {
          let department_id;
          for (let i = 0; i < departments.length; i++) {
            if (answer.department == departments[i].name) {
              department_id = departments[i].id;
            }
          }

          databaseConnection.query(
            `INSERT INTO role (title, salary, department_id) VALUES ("${answer.departmentRole}", ${answer.salary}, ${department_id})`,
            (err, res) => {
              if (err) {
                console.log(err);
              }
              promptInitiate();
            }
          );
        });
    });
}

function viewAllDepartments() {
  databaseConnection.query(
    "SELECT department.id, department.name AS 'department name' FROM department;",
    (err, table) => {
      if (err) {
        console.log(err);
      }
      console.table(table);
      promptInitiate();
    }
  );
}

function addDepartment() {
  inquirer
    .prompt({
      name: "departmentName",
      type: "input",
      message: "What is the name of the department?",
    })
    .then(answer => {
      databaseConnection.query(
        `INSERT INTO department (name) VALUES ("${answer.departmentName}");`,
        (err, res) => {
          if (err) {
            console.log(err);
          }
          promptInitiate();
        }
      );
    });
}
