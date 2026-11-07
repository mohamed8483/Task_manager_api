const repo = require("../repositories/repository.product");
// service reading product


const product_service = async (search,limit, offset) => {
    if (search === "") {
        const products = await repo.get_all_products(limit, offset);
        return products;
    }
    const products = await repo.get_search_products(search,limit, offset);
    return products;
};

const product_service_byid = async (id) => {
    const product = await repo.get_product_byid(id);
    return product;
}
// service creating product

const product_service_create = async (
    // paramters of product will return to repo
    name,
    description,
    price,
    stock,
    category_id
) => {
    const exists = await repo.category_exists(category_id);

    if (!exists) {
        return { error: "CATEGORY_NOT_FOUND" };
    }
    const products = await repo.create_product(
        name,
        description,
        price,
        stock,
        category_id);
    return products;
}

// service update product
const product_service_update = async (
    name,
    description,
    numirc_price,
    numirc_stock,
    numirc_category_id, id) => {

    const exists = await repo.category_exists(numirc_category_id);

    if (!exists) {
        return { error: "CATEGORY_NOT_FOUND" };
    }

    const product_updated = await repo.update_product(
        name,
        description,
        numirc_price,
        numirc_stock,
        numirc_category_id, id)
    return product_updated;
}

// service to delete product
const product_service_delete = async (
    id
) => {
    const product_deleted = await repo.delete_product(
        id
    )
    return product_deleted;
}

module.exports = {
    product_service_byid,
    product_service,
    product_service_create,
    product_service_update,
    product_service_delete,
};