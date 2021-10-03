const db = require('../db')
const bcrypt = require('bcrypt')

/* Helper functions for Passport auth */
const getUserByLocalId = async id => {
  const res = await db.query(
    'SELECT * FROM production_user WHERE id = $1', 
    [id]
  )
  if (res) return res.rows[0]
}

const updateOauthUser = async ({ googleID, email }) => {
  const user = await db.query(
    'UPDATE production_user SET google_id=$1 WHERE email=$2 RETURNING *', 
    [googleID, email]
  )
  return user.rows[0]
}

const getUserByGoogleId = async id => {
  const res = await db.query(
    'SELECT * FROM production_user WHERE google_id = $1', 
    [id]
  )
  if (res) return res.rows[0]
}

const getUserByEmail = async email => {
  const res = await db.query(
    'SELECT * FROM production_user WHERE email = $1', 
    [email]
  )
  if (res) return res.rows[0]
}

/* User creation */
const hashPassword = async (str) => {
  const hashedPassword = await bcrypt.hash(str, 10)
  return hashedPassword
}

const createOauthUser = async ({ email, name }) => {
  try {
    // TODO: add a check that it's a valid gmail address
    // possibly use Joi to validate
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return ({ success: false, message: 'Email already exists' })
    }
    const user = await db.query(
      'INSERT INTO production_user (email, first_name) VALUES ($1, $2) RETURNING *', 
      [email, name]
    )
    return { success: true, user: user.rows[0] }
  } catch (error) {
    console.log(error)
    return error.message
  }
}

const createLocalUser = async ({ email, password, name }) => {
  try {
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return ({ success: false, message: 'Email already exists' })
    }

    const hashedPassword = await hashPassword(password)
    const user = await db.query(
      'INSERT INTO production_user (email, first_name, password) VALUES ($1, $2, $3) RETURNING *', 
      [email, name, hashedPassword]
    )
    if (user.rows.length > 0) {
      return { success: true, user: user.rows[0] }
    }
  } catch (error) {
    console.log(error)
    return error.message
  }
}

const updatePassword = async ({ email, password }) => {
  try {
    const hashedPassword = await hashPassword(password)
    const response = await db.query(
      `UPDATE production_user SET password=$1 WHERE email=$2 RETURNING *`,
      [hashedPassword, email])
    if (response) return response.rows[0]
  } catch (error) {
    return (error.message)
  }
}


module.exports = { 
  updateOauthUser, 
  updatePassword,
  createLocalUser,
  hashPassword,
  createOauthUser, 
  getUserByLocalId, 
  getUserByGoogleId, 
  getUserByEmail
}