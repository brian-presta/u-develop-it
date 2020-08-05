const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();
const sqlite3 = require('sqlite3').verbose();
const inputCheck = require('./utils/inputCheck')
// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = new sqlite3.Database('./db/election.db', err => {
    if (err) {
      return console.error(err.message);
    }
  
    console.log('Connected to the election database.');
  });
  // get all candidates
app.get('/api/candidates', (req,res) => {
  const sql = 
  `SELECT candidates.*, parties.name AS party_name
   FROM candidates
   LEFT JOIN parties on candidates.party_id = parties.id`
  const params = []
  db.all(sql,params, (err, rows) => {
    if (err) {
      res.status(500).json({error: err.message})
      return
    }
    res.json({
      message: 'success',
      data: rows
    })
  });
})
  // GET a single candidate
app.get('/api/candidate/:id', (req,res) => {
  const sql = 
  `SELECT candidates.*, parties.name AS party_name
   FROM candidates
   LEFT JOIN parties on candidates.party_id = parties.id
   WHERE candidates.id = ?`
  db.get(sql,req.params.id, (err,row) => {
    if (err) {
      res.status(400).json({error: err.message})
    }
    res.json({
      message: 'success',
      data: row
    })
  })
})

// Delete a candidate
app.delete('/api/candidate/:id', (req,res) => {
  db.run('DELETE FROM candidates WHERE id = ?',req.params.id, (err,row) => {
    if (err) {
      res.status(400).json({error: err.message})
    }
    res.json({
      message: 'successfully deleted',
      changes: this.changes
    })
  })
})
// Update a candidate's party
app.put('/api/candidate/:id', (req,res) => {
  const sql = 
  `UPDATE candidates
  SET party_id = ?
  WHERE id = ?`
  const params = [req.body.party_id,req.params.id]
  const errors = inputCheck(req.body, 'party_id');
  if (errors) {
    res.status(400).json({ error: errors });
    return;
  }
  db.run(sql,params, function(err,results) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: req.body,
      changes: this.changes
    });
  })
})
// Add a candidate
app.post('/api/candidate', (req, res) => {
  let body = req.body
  const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected');
  if (errors) {
    res.status(400).json({ error: errors });
    return;
  }
  const sql = `INSERT INTO candidates (first_name, last_name, industry_connected) 
              VALUES (?,?,?)`;
  const params = [body.first_name, body.last_name, body.industry_connected];
  // ES5 function, not arrow function, to use `this`
  db.run(sql, params, function(err, result) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({
      message: 'success',
      data: body,
      id: this.lastID
    });
  });
});
// GET all parties as json
app.get('/api/parties', (req, res) => {
  const sql = `SELECT * FROM parties`;
  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    res.json({
      message: 'success',
      data: rows
    });
  });
});
// GET single party by id as json
app.get('/api/party/:id', (req, res) => {
  const sql = `SELECT * FROM parties WHERE id = ?`;
  const params = [req.params.id];
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({
      message: 'success',
      data: row
    });
  });
});
app.delete('/api/party/:id', (req, res) => {
  const sql = `DELETE FROM parties WHERE id = ?`;
  const params = [req.params.id];
  db.run(sql, params, function(err, result) {
    if (err) {
      res.status(400).json({ error: res.message });
      return;
    }

    res.json({ message: 'successfully deleted', changes: this.changes });
  });
});

// Default response for any other request(Not Found) Catch all
app.use((req, res) => {
    res.status(404).end();
  });
  db.on('open', () => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });