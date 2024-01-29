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

app.post('/assign-list', (req, res) => {
  console.log('Received request', req.body);
  try {
    const { userId, listId } = req.body;

    // Dodaj logi do konsoli tutaj
    console.log('Received request to assign list', { userId, listId });

    const data = fs.readFileSync(dbPath, 'utf8');
    const jsonData = JSON.parse(data);

    const userIndex = jsonData.users.findIndex(user => user.id === parseInt(userId));
    if (userIndex === -1) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const listIndex = jsonData.taskLists.findIndex(list => list.id === parseInt(listId));
    if (listIndex === -1) {
      res.status(404).json({ error: 'Task list not found' });
      return;
    }

    // Dodaj logi do konsoli tutaj
    console.log('Found user and list', { userIndex, listIndex });

    // Add listId to user's taskListIds
    jsonData.users[userIndex].taskListIds.push(parseInt(listId));

    // Dodaj obsługę błędów do fs.writeFileSync
    try {
      fs.writeFileSync(dbPath, JSON.stringify(jsonData, null, 2), 'utf8');
    } catch (error) {
      console.error('Error writing to database', error);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error assigning task list to user', error);
    res.status(500).send('Internal Server Error');
  }
});


app.listen(port, 'localhost', () => {
  console.log(`Server is running at http://localhost:${port}`);
});
