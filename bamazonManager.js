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
    showMenu();
});

function showMenu() {
    inquirer
        .prompt({
            name: "menuChoice",
            type: "rawlist",
            message: "What would you like to do?",
            choices: ["VIEW PRODUCTS FOR SALE", "VIEW LOW INVENTORY", "ADD TO INVENTORY", "ADD NEW PRODUCT"]
        })
        .then(function (answer) {
            switch (answer.menuChoice.toUpperCase()) {
                case ("VIEW PRODUCTS FOR SALE"):
                    viewProducts();
                    break;
                case ("VIEW LOW INVENTORY"):
                    lowInventory();
                    break;
                case ("ADD TO INVENTORY"):
                    addInventory();
                    break;
                case ("ADD NEW PRODUCT"):
                    addProducts();
                    break;
            }
        });
}

function viewProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].id + "-" + res[i].product_name + ", " + res[i].department_name + " " + res[i].price + " (" + res[i].quantity + ")");
        }
        showMenu();
    });
}

function lowInventory() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        var lowStock = 0;
        var lowItems = [];
        for (var i = 0; i < res.length; i++) {
            if (res[i].quantity < 5) {
                lowStock++;
                lowItems.push(res[i]);
            }
        }
        if (lowStock > 0) {
            console.log("Items which are low in stock include:")
            for (var i = 0; i < lowItems.length; i++) {
                console.log(lowItems[i].id + "-" + lowItems[i].product_name + ", " + lowItems[i].department_name + " " + lowItems[i].price + " (" + lowItems[i].quantity + ")");
            }
        }

        else {
            console.log("No items are low in stock at this time.")
        }
        showMenu();
    });
}

function addInventory() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].id + "-" + res[i].product_name);
        };
        inquirer
            .prompt([
                {
                    name: "choice",
                    type: "rawlist",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < res.length; i++) {
                            choiceArray.push(res[i].id.toString());
                        }
                        return choiceArray;

                    },
                    message: "What item quantity would you like to increase?"
                },
                {
                    name: "quantity",
                    type: "input",
                    message: "How many would you like to add to the inventory??",
                    validate: function (value) {
                        if (isNaN(value) === false) {

                            return true;
                        }
                        console.log("\nPlease enter a number.")
                        return false;
                    }
                }
            ])
            .then(function (answer) {

                var chosenId;
                for (var i = 0; i < res.length; i++) {
                    if (res[i].id.toString() === answer.choice) {
                        chosenId = res[i];
                    }
                }
                chosenId.quantity += parseInt(answer.quantity);
                replinishStock(chosenId.quantity, chosenId.id);

            });
    });
}

function addProducts() {
    inquirer
        .prompt([
            {
                name: "product",
                type: "input",
                message: "What product would you like to add to the store?"
            },
            {
                name: "department",
                type: "input",
                message: "What department would you like to place your product in?"
            },
            {
                name: "price",
                type: "input",
                message: "What much does your product cost?",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "quantity",
                type: "input",
                message: "What many do you want to add to the store inventory?",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            },
        ])
        .then(function (answer) {

            connection.query(
                "INSERT INTO products SET ?",
                {
                    product_name: answer.product,
                    department_name: answer.department,
                    price: answer.price,
                    quantity: answer.quantity
                },
                function (err) {
                    if (err) throw err;
                    console.log("Your product was added successfully!");

                    showMenu();
                }
            );
        });
}

function replinishStock(quantity, id) {
    connection.query(
        "UPDATE products SET ? WHERE ?",
        [
            {
                quantity: quantity
            },
            {
                id: id
            }
        ],
        function (error) {
            if (error) throw err;

            console.log("Inventory Updated!");
            showMenu();
        }
    );
}