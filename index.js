const express = require('express');
const handlebars = require("handlebars");
const path =require('path');
const app = express();
var fs = require('fs');
const port = 3005


/*
app.get('/', (req, res) => {
  res.send('Hello World!')
})*/



app.get('/', (req, res) => {
    let indexPath = path.join(__dirname, 'WebContent', "index.html");
    var html = fs.readFileSync(indexPath, 'utf8');
    html = handlebars.compile(html)({path: "/static"}) ;
    res.send(html);
});

app.get('/static/platform.js', (req, res) => {
    let indexPath = path.join(__dirname, 'WebContent', "platformWeb.js");
    var html = fs.readFileSync(indexPath, 'utf8');
    res.send(html);
});

app.use("/static",express.static(path.join(__dirname, 'WebContent')));


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})