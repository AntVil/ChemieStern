const PORT = 8080;

const express = require("express");
const fs = require("fs");
const path = require("path");

fs.writeFileSync(
    path.join(__dirname, "src", "_content.txt"),
    fs.readdirSync(path.join(__dirname, "src", "content")).join("\n") + "\n"
);

let app = express();

app.use(express.static("src"))

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});
