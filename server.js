require("dotenv").config();
const { app } = require("./src/app");
const route_products = require("./routes/routes.products");
const route_register = require("./routes/routes.auth")

app.use("/api/products", route_products);
app.use('/api/auth',route_register);
app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        success: false,
        error: "INTERNAL_SERVER_ERROR"
    });
});

console.log("server is running");
app.listen(process.env.SERVER_PORT || 3000);
