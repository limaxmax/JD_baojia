var mysql = require("mysql");
var pool = mysql.createPool({
  connectionLimit: 10,
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'plan'
});

var pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "plan"
});

function getConnectionPromise () {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) reject(err)
      resolve(connection)
    })
  })
}

function sqlExecutor (sql, sqlParams) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) reject(err);
      connection.query(sql, sqlParams, (err, results) => {
        if (err) reject(err);
        resolve(results);
        //释放连接
        connection.release();
      })
    })
  })

}



module.exports = {
  "pool": pool,
  "getConnectionPromise": getConnectionPromise,
  "sqlExecutor": sqlExecutor
}
