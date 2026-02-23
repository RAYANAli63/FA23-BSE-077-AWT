const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');

const app = express();

function ensureDb(res){
    if (!db.isAvailable()){
        res.status(503).json({ error: 'Database unavailable' });
        return false;
    }
    return true;
}

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/submit', (req, res) => {
    if (!ensureDb(res)) return;
    const { user_id, email, phone } = req.body;
    const sql = "INSERT INTO users (user_id, email, phone) VALUES (?, ?, ?)";
    
    db.query(sql, [user_id, email, phone], (err) => {
        if (err) {
            console.error('Insert error:', err);
            return res.status(500).json({ error: err.message || err });
        }
        res.json({ message: 'Data Saved Successfully!' });
    });
});

// Get all users
app.get('/users', (req, res) => {
    if (!ensureDb(res)) return;
    const sql = 'SELECT * FROM users';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Select error:', err);
            return res.status(500).json({ error: err.message || err });
        }
        res.json(results);
    });
});

// Get user by id
app.get('/users/:id', (req, res) => {
    if (!ensureDb(res)) return;
    const sql = 'SELECT * FROM users WHERE id = ?';
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message || err });
        if (!results.length) return res.status(404).json({ error: 'Not found' });
        res.json(results[0]);
    });
});

// Update user
app.put('/users/:id', (req, res) => {
    if (!ensureDb(res)) return;
    const { user_id, email, phone } = req.body;
    const sql = 'UPDATE users SET user_id = ?, email = ?, phone = ? WHERE id = ?';
    db.query(sql, [user_id, email, phone, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message || err });
        res.json({ message: 'Updated', affectedRows: result.affectedRows });
    });
});

// Delete user
app.delete('/users/:id', (req, res) => {
    if (!ensureDb(res)) return;
    const sql = 'DELETE FROM users WHERE id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message || err });
        res.json({ message: 'Deleted', affectedRows: result.affectedRows });
    });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});