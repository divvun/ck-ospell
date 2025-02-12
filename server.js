"use strict";

const path = require("path");
const express = require("express");
const morgan = require("morgan");

const port = process.env.NODE_PORT || 3000;
const server = express();

server.use(morgan('combined'));

server.use("/spellcheck/lf/giella3/ckgiella",
  express.static(path.join(__dirname, "public"))
);

server.use(
  "/ckeditor",
  express.static(path.join(__dirname, "node_modules/ckeditor4"))
);

server.use(express.static(
  path.join(__dirname, "client"),
  { index: ["index.html"] })
);

const routes = require("./server/index");
server.use(routes);

server.listen(port, () => {
  process.stdout.write("Server started at port " + port + "!\n");
});
