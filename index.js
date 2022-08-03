import express from 'express';
import mysql from 'mysql'; // https://expressjs.com/en/guide/database-integration.html
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
    PORT,
    HOST,
    USER,
    PASSWORD,
    DATABASE,
    TOKEN_KEY
} from './constants.js';
import { checkAuthorization } from './middlware.js';
import { routes } from './routes.js';

const app = new express();
app.use(express.json()); // Required to handle JSON POST requests.

const db = mysql.createConnection({
    host: HOST,
    user: USER,
    password: PASSWORD,
    database: DATABASE,
});
db.connect();

app.post(routes.login, async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;
        const lowerCaseEmail = email.toLowerCase();
        const encryptedPassword = await bcrypt.hash(password, 10);
        db.query('SELECT id, password FROM users WHERE email = ?', [lowerCaseEmail], async (error, results) => {
            if (error) {
                throw error;
            }
            let id;
            if (!results.length) {
                db.query('INSERT INTO users SET ?', {
                    email: lowerCaseEmail,
                    password: encryptedPassword,
                    registered: Date.now()
                }, (error, results) => {
                    if (error) {
                        throw error;
                    }
                    id = results.insertId;
                });
            } else {
                id = results[0].id;
                const actualPassword = results[0].password;
                if (!(await bcrypt.compare(password, actualPassword))) {
                    throw error;
                }
                // Create a token.
                const token = jwt.sign(
                    {user_id: id, email: lowerCaseEmail},
                    TOKEN_KEY,
                    {
                        expiresIn: '12h',
                    }
                );
                res.status(200).send({token});
            }
        });
    } catch (error) {
        console.log(error);
        res.status(401).send('Authentication Failed!');
    }
});

// https://github.com/mysqljs/mysql#escaping-query-values
app.get(routes.getCarsById, checkAuthorization, (req, res) => {
    try {
        if (!res.locals.user?.user_id) {
            throw 'Error! Not authorized.';
        }
        const {headers, body, params: {id}} = req;
        db.query('SELECT * FROM cars WHERE id = ?', [id], (error, results, fields) => {
            if (error) {
                throw error;
            }
            if (results.length) {
                res.status(200).send(results[0]);
            } else {
                res.status(404).send('Not found!');
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error!');
    }
});

app.get(routes.getAllCars, checkAuthorization, (req, res) => {
    try {
        if (!res.locals.user?.user_id) {
            throw 'Error! Not authorized.';
        }
        const {headers, body, params: {id}} = req;
        db.query('SELECT * FROM cars', (error, results, fields) => {
            if (error) {
                throw error;
            }
            res.status(200).send(results);
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error!');
    }
});

app.post(routes.addCar, checkAuthorization, (req, res) => {
    try {
        if (!res.locals.user?.user_id) {
            throw 'Error! Not authorized.';
        }
        const {headers, body} = req;
        db.query('INSERT INTO cars SET ?', body, function (error, results, fields) {
            if (error) {
                throw error;
            }
            res.status(200).send('ok');
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error!');
    }
});

app.listen(PORT, () => {
    console.log(`App started on ${PORT}`);
});
