const mysql = require('mysql');

const settings = {
    CLEARDB : process.env.CLEARDB,
}

var connection = mysql.createConnection({
    host : process.env.DBHOST,
    user : process.env.DBUSER,
    password : process.env.DBPWD
});

connection.connect((err) => {
    if(err) throw err;
    
    const TABLECREATE = `
        CREATE TABLE IF NOT EXISTS votes (
            VOTE_ID INT(11) AUTO_INCREMENT,
            user char(50) NOT NULL,
            idsong CHAR(36) NOT NULL,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (VOTE_ID),
            FOREIGN KEY (user) REFERENCES users(user)
        );`;

    const USERTABLECREATE = `
        CREATE TABLE IF NOT EXISTS users (
            user char(50) NOT NULL,
            pass CHAR(60) NOT NULL,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user)
        )`;

    connection.query("CREATE DATABASE IF NOT EXISTS spotivote",function(err,result){
        if(err) throw err;
    });
    connection.query("USE spotivote",function(err,result){
        if(err) throw err;
    });
    connection.query(USERTABLECREATE, function(err, result) {
        if (err) throw err;
    });
        connection.query(TABLECREATE, function(err, result) {
        if (err) throw err;
    });
    if(settings.CLEARDB.toUpperCase() == "TRUE"){
        connection.query("TRUNCATE TABLE votes", function(err, result) {
            if (err) throw err;
        });
    }

    console.log("connected to DB");
});

module.exports = { connection };
