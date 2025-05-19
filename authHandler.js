const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('./config.js');
const { connection }= require('./connection.js');


const generateToken = (KEY) => {
    return jwt.sign({ id: KEY }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).send("null user/password");
        }

        connection.query(
            "SELECT user FROM users WHERE user = ?",
            [username],
            async (err, result) => {
                if (err) throw err;

                if (result.length > 0) {
                    return res.status(400).send("user exists already");
                }

                const hashedPassword = await bcrypt.hash(password, 10);

                connection.query(
                    "INSERT INTO users (user, pass) VALUES (?, ?)",
                    [username, hashedPassword],
                    (err, result) => {
                        if (err) throw err;
                        
                        const token = generateToken(username);
                        return res.status(201).json({
                            message: 'welcome yay',
                            token, //gia json
                            user: username,
                            expiresIn : JWT_EXPIRES_IN
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).send('ERR');
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).send("null user/password");
        }

        connection.query(
            "SELECT * FROM users WHERE user = ?",
            [username],
            async (err, results) => {
                if (err) throw err;

                if (results.length === 0) {
                    return res.status(400).send("wrong user/password");
                }

                const pass = results[0].pass;

                const match = await bcrypt.compare(password, pass);

                if (!match) {
                    return res.status(400).send("wrong user/password");
                }

                const token = generateToken(username);

                return res.status(201).json({
                    message: 'ok',
                    token, //gia json
                    user: results[0].user,
                    expiresIn : JWT_EXPIRES_IN
                });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};