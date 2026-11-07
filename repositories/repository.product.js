
const { pool } = require("../config/db");
// repo Query to read products
const get_all_products = async (limit, offset) => {
    const result = await pool.query(`SELECT * FROM products
        ORDER BY id 
        LIMIT $1 OFFSET $2;`, [limit, offset]);
    return result.rows;
};

const get_search_products = async (search, limit, offset) => {
    const result = await pool.query(`
    SELECT * FROM products
    WHERE name ILIKE $1
    ORDER BY id
    LIMIT $2 OFFSET $3 `,[`%${search}%`, limit, offset]);
    return result.rows;
};

const get_product_byid = async (id) => {
    const result = await pool.query(`SELECT * FROM products
        WHERE id = $1;`, [id]);
    return result.rows[0];
}
// repo Query to add product in table products 
const create_product = async (
    name, description, price, stock, category_id
) => {
    const result = await pool.query(
        `INSERT INTO products
        (name, description, price, stock, category_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [name, description, price, stock, category_id]
    );

    return result.rows[0];
};
// updata Query to update product in table products 
const update_product = async (
    name, description, numirc_price, numirc_stock, numirc_category_id, numirc_id
) => {
    const result = await pool.query(`
        UPDATE products
        SET name = $1,
            description = $2,
            price = $3,
            stock = $4,
            category_id = $5
        WHERE id = $6
        RETURNING *;`,
        [name, description, numirc_price, numirc_stock, numirc_category_id, numirc_id]);
    return result.rows[0];
}


const delete_product = async (id) => {
    const result = await pool.query(`DELETE FROM products
WHERE id = $1
RETURNING *;`, [id])
    return result.rows[0];
}
const category_exists = async (category_id) => {
    const result = await pool.query(
        "SELECT 1 FROM categories WHERE id = $1",
        [category_id]
    );

    return result.rowCount > 0;
};

module.exports = {
    get_search_products,
    get_product_byid,
    get_all_products,
    create_product,
    update_product,
    delete_product,
    category_exists,
};