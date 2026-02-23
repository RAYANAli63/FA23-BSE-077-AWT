require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

const app = express();

// Middleware to read form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve HTML file from the public folder
app.use(express.static("public"));

// Connect Database
connectDB();

// Use Routes
app.use("/users", require("./routes/userRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));