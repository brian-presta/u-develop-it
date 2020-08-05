const express = require('express');
const router = express.Router();
const db = require('../../db/database');
const inputCheck = require('../../utils/inputCheck');

// get all candidates
router.get('/candidates', (req,res) => {
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
  router.get('/candidate/:id', (req,res) => {
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
  router.delete('/candidate/:id', (req,res) => {
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
  router.put('/candidate/:id', (req,res) => {
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
  router.post('/candidate', (req, res) => {
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

module.exports = router;