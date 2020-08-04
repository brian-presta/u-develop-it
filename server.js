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
  const sql =`SELECT * FROM candidates`;
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
  db.get('SELECT * FROM candidates WHERE id = ?',req.params.id, (err,row) => {
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




// Default response for any other request(Not Found) Catch all
app.use((req, res) => {
    res.status(404).end();
  });
  db.on('open', () => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });