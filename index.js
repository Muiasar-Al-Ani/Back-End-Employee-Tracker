// Imports and requires the inquirer
const inquirer = require('inquirer');

// Imports and requires mysql2 npm package
const mysql = require('mysql2');

// Imports and requires console.table npm package
const consoleTable = require('console.table');


// Establishes the connection with the database by using the specified information
const databaseConnection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '0000',
    database: 'employee_database'
});

