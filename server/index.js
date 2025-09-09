const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

app.use(cors({
  origin: 'http://localhost:5173' 
}));

app.use((req, res, next) => {
  const latency = Math.random() * 1200 + 300;
  const shouldFail = Math.random() < 0.25;

  setTimeout(() => {
    if (shouldFail) {
      console.log('Request failed!');
      const statusCode = Math.random() < 0.5 ? 500 : 429;
      res.status(statusCode).send({ error: 'Server is feeling flaky!' });
    } else {
      next();
    }
  }, latency);
});

let notes = [
    {
        id: uuidv4(),
        title: "Welcome Note",
        body: "This is a sample note from the server. Try editing it or creating a new one!",
        updatedAt: new Date().toISOString(),
    }
];

app.get('/notes', (req, res) => {
  console.log(`GET /notes - Returning ${notes.length} notes`);
  const sortedNotes = [...notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  res.json({ data: sortedNotes });
});

app.post('/notes', (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    return res.status(400).json({ error: 'Title and body are required.' });
  }

  const newNote = {
    id: uuidv4(),
    title,
    body,
    updatedAt: new Date().toISOString(),
  };

  notes.push(newNote);
  console.log(`POST /notes - Created note ${newNote.id}`);
  res.status(201).json({ data: newNote });
});

app.put('/notes/:id', (req, res) => {
  const { id } = req.params;
  const { title, body } = req.body;
  const noteIndex = notes.findIndex(n => n.id === id);

  if (noteIndex === -1) {
    return res.status(404).json({ error: 'Note not found.' });
  }
  
  const updatedNote = {
      ...notes[noteIndex],
      title: title || notes[noteIndex].title,
      body: body || notes[noteIndex].body,
      updatedAt: new Date().toISOString(),
  };

  notes[noteIndex] = updatedNote;
  console.log(`PUT /notes/:id - Updated note ${id}`);
  res.json({ data: updatedNote });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log('Network simulation is ON: ~25% failure rate, 300-1500ms latency.');
});