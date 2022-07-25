const PORT = 8080;

const express = require("express");
const fs = require("fs");
const path = require("path");

let content = fs.readdirSync(path.join(__dirname, "src", "content"));
fs.writeFileSync(path.join(__dirname, "src", "_content.txt"), content.join("\n"));

let app = express();

app.use(express.static("src"))

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});
