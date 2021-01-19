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
        this.toShutdown = null;
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
        if(socket.id == this.owner){
            console.log("Recieved state from daddy 😰😍");
            this.state = state;
        }
        if(this.toShutdown!=null){
            clearTimeout(this.toShutdown);
            this.toShutdown = null;
        }
    }

    removeUser(socket){
        this.userNum -= 1;

        delete this.users[socket.id];
        //if the owner disconnected transfer ownership to the person that joined after current owner
        if(this.owner === socket.id){
            if(this.userNum == 0){
                //start countdown to destroy room
                this.toShutdown = setTimeout(()=>{
                    console.log("Shutting down the function! 🛑✋🏿")
                    delete rooms[this.name];
                }, 1000 * 60 * 5)
                
            }else{
                console.log("oooh new man 👀");
                
                this.owner = Object.keys(this.users)[0];
            }
        }
        
    }
}

app.use("/static",express.static(path.join(__dirname, 'WebContent')));

function makeId(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

app.get('/favicon.ico', (req, res) => {
    res.send();
});

app.get('/:slug', (req, res) => {
    
   
    if(rooms[req.params.slug] === undefined){

        let roomId = makeId(15);
        console.log("~Curating new vibe sesh~: "+roomId);
        rooms[roomId] = new Room(roomId);
        res.redirect("/"+roomId);
    }else{
        let indexPath = path.join(__dirname, 'WebContent', "index.html");
        var html = fs.readFileSync(indexPath, 'utf8');
        html = handlebars.compile(html)({path: "/static"}) ;
        res.send(html);
    }
    
});

app.get('/', (req, res) => {
    


    let roomId = makeId(15);
    console.log("Making vibe sesh: "+roomId);
    rooms[roomId] = new Room(roomId);
    res.redirect("/"+roomId);

});

io.on('connection', (socket) => {
    try{

        

        let roomSlug = socket.request.headers.referer.replace("http://","").replace("https://","").replace("/","").replace(socket.request.headers.host,"");
       // console.log("HEY, GET A LOAD OF THIS GUY "+roomSlug);
       // console.log(socket.request.headers.referer);
    
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
    }catch(e){
        console.error(`This ain't it bruh...${e}`)
    }
});


http.listen(process.env.PORT || 3005, () => {
    console.log(`Reliable app listening at http://localhost:${port}`)
})

