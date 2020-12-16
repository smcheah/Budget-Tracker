const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/budget", {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

// routes
app.use(require("./routes/api.js"));
// app.use(compression());

app.listen(PORT, () => {
    console.log(`App running on http://localhost:${PORT} !`);
});