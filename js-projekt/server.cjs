const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

const dbPath = path.join(__dirname, 'data', 'db.json');

app.get('/', (req, res) => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    const jsonData = JSON.parse(data);
    res.json(jsonData);
  } catch (error) {
    console.error('Error reading db.json', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/', (req, res) => {
  try {
    const newData = req.body;
    fs.writeFileSync(dbPath, JSON.stringify(newData, null, 2), 'utf8');
    res.json({ success: true });
  } catch (error) {
    console.error('Error writing to db.json', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, 'localhost', () => {
  console.log(`Server is running at http://localhost:${port}`);
});
