import express from 'express';
import mysql from 'mysql'; // https://expressjs.com/en/guide/database-integration.html

const app = new express();
app.use(express.json()); // Required to handle JSON POST requests.

const {
  PORT = 3000,
  HOST = 'localhost',
  USER = 'sanjana',
  PASSWORD = 'jTpx6gY-l4uSxF-C',
  DATABASE = 'car_database',
} = process.env;

const db = mysql.createConnection({
  host: HOST,
  user: USER,
  password: PASSWORD,
  database: DATABASE,
});
db.connect();

// https://github.com/mysqljs/mysql#escaping-query-values
app.get('/cars/:id', (req, res) => {
  try {
    const { headers, body, params: { id } } = req;
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

app.get('/cars', (req, res) => {
  try {
    const { headers, body, params: { id } } = req;
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

app.post('/cars', (req, res) => {
  try {
    const { headers, body } = req;
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
})