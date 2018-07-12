var inquirer = require("inquirer");
var mysql = require("mysql");
var connection = mysql.createConnection({
    host: "localhost",


    port: 3306,

    user: "root",

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
    });
    connection.query("SELECT id FROM products", function (err, res) {
        if (err) throw err;

        inquirer
            .prompt([
                {
                    name: "choice",
                    type: "rawlist",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < res.length; i++) {
                            choiceArray.push(JSON.parse(res[i].id));
                        }
                        return choiceArray;
                    },
                    message: "What item would you like to buy?"
                },
                {
                    name: "quantity",
                    type: "input",
                    message: "How many would you like to buy?"
                }
            ])
            .then(function (answer) {

                var chosenId;
                for (var i = 0; i < res.length; i++) {
                    if (res[i].id === answer.choice) {
                        chosenId = res[i];
                    }
                }

                if (chosenId.quantity > parseInt(answer.quantity)) {
                    chosenId.quantity -= answer.quantity;
                    connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [
                            {
                                quantity: chosenId.quantity
                            },
                            {
                                id: chosenId.id
                            }
                        ],
                        function (error) {
                            if (error) throw err;
                        }
                    );
                    connection.query("SELECT price FROM products where ?",
                        {
                            id: chosenId.id

                        }, function (err, res) {
                            if (err) throw err;
                            var total = chosenId.price;
                            total *= answer.quantity;
                            console.log("Thank you for your purchase! Your total is: " + total);
                        });
                }
                else {

                    console.log("Sorry we don't have that many of this item!");
                    showProducts();
                }
            });
    });
}
// connection.end();