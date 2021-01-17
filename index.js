const express = require('express');
const handlebars = require("handlebars");
const path =require('path');
const app = express();
var fs = require('fs');
const port = 3005;
const http = require('http').Server(app);
const io = require('socket.io')(http);


let rooms = {};

class Room {

    constructor(name){
        this.name = name;
        this.users = {};
        this.state = null;
        this.userNum = 0;
    }

    addUser(socket){
        this.userNum += 1;
        socket.join(this.name);
        this.users[socket.id] = socket;
        if(this.userNum== 1){
            this.owner = socket.id;
            console.log(`Hi, dad 💦. Your ID is ${socket.id}`)
        }
        
        if(this.state!=null){
            
            socket.emit("data", {action: "State", state: this.state});
        }
    }

    updateState(socket, state){
        console.log("user count: "+this.userNum)
        if(socket.id == this.owner){
            console.log("Recieved state from daddy 😰😍");
            this.state = state;
        }
    }

    removeUser(socket){
        this.userNum -= 1;

        delete this.users[socket.id];
        //if the owner disconnected transfer ownership to the person that joined after current owner
        if(this.owner === socket.id){
            if(this.userNum == 0){
                //start countdown to destroy room
                console.log("Shutting down the function! 🛑✋🏿")
                delete rooms[this.name];
            }else{
                console.log("oooh new man 👀");
                
                this.owner = Object.keys(this.users)[0];
            }
        }
        
    }
}

app.use("/static",express.static(path.join(__dirname, 'WebContent')));

app.get('/*', (req, res) => {
    let indexPath = path.join(__dirname, 'WebContent', "index.html");
    var html = fs.readFileSync(indexPath, 'utf8');
    html = handlebars.compile(html)({path: "/static"}) ;
    res.send(html);
});


io.on('connection', (socket) => {
    console.log('a user connected');

    let roomSlug = socket.request.headers.referer.replace("http://","").replace("/","").replace(socket.request.headers.host,"");
   

    if(rooms[roomSlug]===undefined){
        rooms[roomSlug] = new Room(roomSlug);
        
    }
    let room = rooms[roomSlug];
    room.addUser(socket);

    //console.log("User connected to "+roomSlug);
    let ignoredActions = ["Refresh"];
    socket.on('data', (msg) => {
        if(msg.action == "State"){
            //console.log(msg);
            room.updateState(socket, msg.data);
        }else if(!ignoredActions.includes(msg.action)){
            socket.to(roomSlug).emit("data", msg);
        }
    });

  

    socket.on('disconnect', function() {

        room.removeUser(socket);
    });
      
});


http.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})