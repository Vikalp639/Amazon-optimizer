// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();
// const db = require("./db");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // ROUTES
// app.use("/api", require("./routes/optimize"));

// app.listen(5000, () => {
//     console.log("Server running at http://localhost:5000");
// });
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const optimizeRoute = require("./routes/optimize");

const app = express();
app.use(express.json());
app.use(cors());

// Use optimize route
app.use("/api/optimize", optimizeRoute);
app.use("/api/save-result", require("./routes/saveResult"));
// Start Server
app.listen(process.env.PORT || 5000, () => {
    console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
});

