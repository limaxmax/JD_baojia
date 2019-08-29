var config = {
  "database": "plans",
  "username": "root",
  "password": "root",
  "other": {
    "host": "localhost",
    "port": 3306,
    "pool": {
      "max": 5,
      "min": 1,
      "idle": 30000
    },
    "timezone": "+08:00"
  }
}

module.exports = config