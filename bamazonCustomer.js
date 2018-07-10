var inquirer = require("inquirer");
var mysql = require("mysql");
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazon_db"
});

connection.connect(function (err) {
    if (err) throw err;
    showProducts();
});

function showProducts() {
    console.log("Items for sale include:")
    connection.query("SELECT id, product_name, department_name, price FROM products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].id + "-" + res[i].product_name + ", " + res[i].department_name + " " + res[i].price);
        }

        inquirer
            .prompt({
                name: "itemChoice",
                type: "list",
                choices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                message: "What item ID would you like to buy?"
            },
                {
                    name: "quantity",
                    type: "input",
                    message: "How many would you like to buy?"
                }
            )
            .then(function (answer) {

                console.log(answer.itemChoice = answer.quatity);
            });
    });
}


// connection.end();