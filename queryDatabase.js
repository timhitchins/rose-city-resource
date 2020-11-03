// const { Pool } = require('pg');

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   max: 1,
//   ssl: { rejectUnauthorized: false }
// });

// function queryDatabase(queryString, args=null, onSuccess, onError=null) {
//   pool.query(queryString, args, (err, results) => {
//     if (err) { 
//       if (onError && onError instanceof Function) { 
//         onError(); 
//       }
//       else {
//         throw err;
//       }
//     }
//     if (results) {
//       if (onSuccess && onSuccess instanceof Function) { 
//         onSuccess();
//       } else {
//         console.error('Query function missing onSuccess() parameter. Please enter the missing argument and try again.');
//       }
//     }
//   })
// };


// module.exports = queryDatabase; 