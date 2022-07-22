import express from 'express';

const app = new express();
app.use(express.json()); // Required to handle JSON POST requests.
const PORT = process.env.PORT || 3000;

const cars = [
  {
    id: 1,
    model: 'maruti',
  },
  {
    id: 2,
    model: 'tata',
  },
  {
    id: 3,
    model: 'benz',
  }];

app.get('/cars/:id', (req, res) => {
  try {
    const { headers, body, params: { id } } = req;
    res.status(200).send(cars.filter(car => car.id === parseInt(id)));
  } catch (error) {
    console.log(error);
  }
});

app.post('/cars', (req, res) => {
  try {
    const { headers, body } = req;
    res.status(200).send(body);
  } catch (error) {
    console.log(error);
  }
});

app.listen(PORT, () => {
  console.log(`App started on ${PORT}`);
})