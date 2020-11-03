// const { pool } = require('./queryDatabase');
// const LocalStrategy = require("passport-local").Strategy;
// const bcrypt = require("bcrypt");
// require("dotenv").config();
// const queryDatabase = require('./queryDatabase');

// // queryDatabase(
// //   //pool.query
// //   (
// //     'SELECT * FROM users', (err, results) => {
// //       if (err) { throw err } 
// //       else if (results) {
// //         console.log(results);
// //       }
// //     }
// //   )
// // )
// const successCallback = (results) => {
//   console.log(results.rows[o])
// }

// queryDatabase(
//   `INSERT INTO users ('user5', 'email5@gmail.com', 'password') RETURNING id, password`, successCallback(results)
// )

// // app.post("/users/register", async (req, res) => {
// //   let { name, email, password, password2 } = req.body;

// //   let errors = [];

// //   console.log({
// //     name,
// //     email,
// //     password,
// //     password2
// //   });

// //   if (!name || !email || !password || !password2) {
// //     errors.push({ message: "Please enter all fields" });
// //   }

// //   if (password.length < 6) {
// //     errors.push({ message: "Password must be a least 6 characters long" });
// //   }

// //   if (password !== password2) {
// //     errors.push({ message: "Passwords do not match" });
// //   }

// //   if (errors.length > 0) {
// //     res.render("register", { errors, name, email, password, password2 });
// //   } else {
// //     hashedPassword = await bcrypt.hash(password, 10);
// //     console.log(hashedPassword);
// //     // Validation passed
// //     pool.query(
// //       `SELECT * FROM users
// //         WHERE email = $1`,
// //       [email],
// //       (err, results) => {
// //         if (err) {
// //           console.log(err);
// //         }
// //         console.log(results.rows);

// //         if (results.rows.length > 0) {
// //           return res.render("register", {
// //             message: "Email already registered"
// //           });
// //         } else {
// //           pool.query(
// //             `INSERT INTO users (name, email, password)
// //                 VALUES ($1, $2, $3)
// //                 RETURNING id, password`,
// //             [name, email, hashedPassword],
// //             (err, results) => {
// //               if (err) {
// //                 throw err;
// //               }
// //               console.log(results.rows);
// //               req.flash("success_msg", "You are now registered. Please log in");
// //               res.redirect("/users/login");
// //             }
// //           );
// //         }
// //       }
// //     );
// //   }
// // });                     