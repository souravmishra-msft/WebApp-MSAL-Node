const path = require("path");
const express = require("express");
const cookieParser = require('cookie-parser');
const morgan = require("morgan");
const dotenv = require("dotenv");

dotenv.config({ path: "./config/.env" });
const route = require("./routes/route");




const PORT = process.env.PORT;
const app = express();

app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.urlencoded({ urlencoded: true }));
app.use(express.json());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname + "/public")));

app.use("/", route);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
