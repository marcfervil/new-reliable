const express = require('express');
const handlebars = require("handlebars");
const path =require('path');
const app = express();
var fs = require('fs');
const port = 3005;
const http = require('http').Server(app);
const io = require('socket.io')(http);

/*
app.get('/', (req, res) => {
  res.send('Hello World!')
})*/

app.use("/static",express.static(path.join(__dirname, 'WebContent')));

app.get('/*', (req, res) => {
    let indexPath = path.join(__dirname, 'WebContent', "index.html");
    var html = fs.readFileSync(indexPath, 'utf8');
    html = handlebars.compile(html)({path: "/static"}) ;
    res.send(html);
    
});


io.on('connection', (socket) => {
    console.log('a user connected');
    console.log("Fewijfwei???")
});
  

http.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})