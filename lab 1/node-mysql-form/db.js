const mysql = require('mysql2');

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '', // If you have a password for XAMPP/MySQL set it here
    database: 'nodeform',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
let dbAvailable = false;

pool.getConnection((err, connection) => {
    if (err) {
        console.error('MySQL connection error:', err.message || err);
        dbAvailable = false;
        return;
    }
    dbAvailable = true;
    console.log('MySQL Connected...');
    connection.release();
});

module.exports = {
    query: function(sql, params, cb){
        try {
            return pool.query(sql, params, cb);
        } catch (err) {
            // ensure callback gets the error instead of throwing
            if (typeof cb === 'function') return cb(err);
            throw err;
        }
    },
    isAvailable: function(){ return dbAvailable; },
    pool
};