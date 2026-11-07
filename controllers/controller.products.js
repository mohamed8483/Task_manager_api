const serve = require("../services/service.products");

const getallproduct = async (req, res) => {
    let limit = Number(req.query.limit);

    let offset = Number(req.query.offset);

    let rawsearch = req.query.q;


    if (limit == undefined || limit == null || limit <= 0 || limit > 100
        || !Number.isSafeInteger(limit) || Number.isNaN(limit)) {
        limit = 10;
    }

    if (offset == undefined || offset == null || offset < 0 || Number.isNaN(offset)
        || !Number.isInteger(offset)) {
        offset = 0;
    }

    if (rawsearch !== undefined && typeof rawsearch !== "string") {
        return res.status(400).json([{
            message: "search query must be a string",
        }]);
    }
    
    const search = rawsearch?.trim() ?? "";
    const product = await serve.product_service(search, limit, offset);
    return res.status(200).json(product);
};

const getproduct = async (req, res) => {
    const numirc_id = Number(req.params.id);
    // validation test 
    if (!Number.isSafeInteger(numirc_id) || numirc_id <= 0) {
        return res.status(400).json([{
            message: "the id not valid"
        }]);
    }

    const product = await serve.product_service_byid(numirc_id);
    if (product == undefined) {

        return res.status(404).json([{
            message: "product not found"
        }]);
    }
    else {
        return res.status(200).json(product);
    }
}

const createproduct = async (req, res) => {
    const { name, description, price, stock, category_id } = req.body;
    if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json([{
            message: "name is not validated"
        }])
    }
    if (typeof description !== 'string' && description !== undefined && description !== null) {
        return res.status(400).json([{
            message: "description not validated"
        }]);
    }
    if (
        typeof price !== "number" ||
        !Number.isFinite(price) ||
        price <= 0
    ) {
        return res.status(400).json({
            message: "Price must be a positive number"
        });
    }
    if (typeof stock !== "number" ||
        !Number.isSafeInteger(stock) ||
        stock < 0) {
        return res.status(400).json({
            message: "stock must be a positive integer"
        });
    }
    if (typeof category_id !== "number" || !Number.isSafeInteger(category_id) || category_id <= 0) {
        return res.status(400).json([{
            message: "the category_id not valid"
        }]);
    }
    const product = await serve.product_service_create(
        name.trim(),
        description,
        price,
        stock,
        category_id);
    if (product?.error === "CATEGORY_NOT_FOUND") {
        return res.status(400).json({
            message: "Category not found"
        });
    }
    return res.status(201).json(product);

};

// controller of update products
const updataeproduct = async (req, res) => {
    const id = req.params.id;

    const { name, description, price, stock, category_id } = req.body;

    const numirc_id = Number(id);

    const numirc_price = price;

    const numirc_stock = stock;

    const numirc_category_id = category_id;

    if (!Number.isSafeInteger(numirc_id) || numirc_id <= 0) {
        return res.status(400).json([{
            message: "the id not valid"
        }]);
    } if (typeof category_id !== "number" || !Number.isSafeInteger(numirc_category_id) || numirc_category_id <= 0) {
        return res.status(400).json([{
            message: "the category_id not valid"
        }]);
    } if (
        typeof price !== "number" ||
        !Number.isFinite(price) ||
        price <= 0
    ) {
        return res.status(400).json({
            message: "Price must be a positive number"
        });
    } if (typeof stock !== "number" ||
        !Number.isSafeInteger(numirc_stock) ||
        numirc_stock < 0) {
        return res.status(400).json({
            message: "stock must be a positive integer"
        });
    } if (
        typeof req.body.name !== "string" ||
        req.body.name.trim().length === 0
    ) {
        return res.status(400).json({
            message: "Name must be a non-empty string"
        });
    } if (
        req.body.description !== undefined &&
        req.body.description !== null &&
        typeof req.body.description !== "string"
    ) {
        return res.status(400).json({
            message: "Description must be a string or null"
        });
    }
    const product_edited = await serve.product_service_update(
        name.trim(),
        description,
        numirc_price,
        numirc_stock,
        numirc_category_id,
        numirc_id
    );
    if (product_edited == undefined) {
        return res.status(404).json([{
            message: "product not found "
        }])
    }
    else if (product_edited.error === "CATEGORY_NOT_FOUND") {
        return res.status(400).json([{
            message: "category not found"
        }])
    }
    else {
        return res.status(200).json(product_edited);
    }
}

const deleteproduct = async (req, res) => {
    const id = req.params.id;
    const numirc_id = Number(id);
    if (!Number.isSafeInteger(numirc_id) || numirc_id <= 0) {
        return res.status(400).json([{
            message: "the id not valid"
        }]);
    }
    const product_deleted = await serve.product_service_delete(
        numirc_id
    )
    if (product_deleted == undefined) {
        return res.status(404).json([{
            message: "product not found"
        }])
    }
    else {
        return res.status(204).end();
    }
}
module.exports = {
    getproduct,
    getallproduct,
    createproduct,
    updataeproduct,
    deleteproduct,
};