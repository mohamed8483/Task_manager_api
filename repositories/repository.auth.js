const { escapeIdentifier } = require("pg");
const { pool } = require("../config/db");

const find_user_by_username = async (username) => {
    const result = await pool.query(`   
        SELECT id FROM users 
        WHERE username = $1`, [username]);
    return result.rowCount > 0;
}


const find_user_by_email = async (email) => {
    const result = await pool.query(`
        SELECT id FROM users 
        WHERE email = $1`, [email])
    return result.rowCount > 0;
}


const find_user_by_identifier_to_check = async (identifier) => {
    const result = await pool.query(`
        SELECT username , email , password_hash FROM users 
        WHERE email = $1 OR username = $1`, [identifier])
    return result.rowCount > 0;
}


const find_user_by_identifier = async (identifier) => {
    const result = await pool.query(`SELECT id, username, email, password_hash, role
FROM users
WHERE username = $1 OR email = $1;`, [identifier])
    return result.rows[0];
}


const create_user = async (username, email, password_hash) => {
    const result = await pool.query(
        `INSERT INTO users (username, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, username, email, role, created_at`, [username, email, password_hash]
    );

    return result.rows[0];
}

module.exports = {
    find_user_by_username,
    find_user_by_email,
    find_user_by_identifier,
    find_user_by_identifier_to_check,
    create_user
}