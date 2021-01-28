function randInt(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

function randomColor (){
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
      }
    let r = randInt(90, 255);
    let g = randInt(90, 255);
    let b = randInt(90, 255);
   // console.log(`rgb(${r}, ${g}, ${b})`)
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

class Mouse{

    constructor(pos, name, color = randomColor()){
        
        this.pos = pos;
        this.name = name;
        this.color = color;
        
        let boundRect = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
        this.span = $("<span/>").css("white-space", "nowrap");
       
        $.get(`${path}/images/icons/point2.svg`, (data)=>{
            let svgStr = new XMLSerializer().serializeToString(data.documentElement);
            let img = $($.parseHTML(svgStr))[0];
            img.setAttribute("width", 50);
            img.setAttribute("height", 60);
            this.img = this.span.append(img);


            img.style.stroke = "black";


            this.span.append($("<span/>").css({"font-size":30, "user-select": "none" , "margin-top":60, "color": this.color}).text(name));
            
            
            
         
            canvas.appendChild(boundRect);
            boundRect.appendChild(this.span[0]);
            boundRect.setAttribute("width", this.span.innerWidth());
            this.span.find("path")[0].style.stroke=this.color;
           // console.log( this.span.find("path")[0]);

        });
       
        
        boundRect.setAttribute("width", 50);
        boundRect.setAttribute("height", 60);
        boundRect.setAttribute("x", pos.x);
        boundRect.setAttribute("y", pos.y);
        boundRect.setAttribute("fill", "red");

      

        this.svg = boundRect;
        this.animating = false;
        this.queue=[];
    }

    moveTo(pos){
        this.pos = pos;
        this.svg.setAttribute("x", this.pos.x);
        this.svg.setAttribute("y", this.pos.y);
        
    }

    

    getAnimation(){
        return this.animation;
    }
    
    moveToPath(path, start=true, id=Reliable.makeId(5) ){
     //   console.log(path.size)

       // console.log(pathDist);
       //if(start)console.log(path.length);
       let pos = path.splice(0, 1)[0]
       if(pos===undefined)return;
    //if(start)canvas.appendChild(this.svg);

        let an = () =>{
            let self = this;

            this.animationDestination = pos; 
            this.animating = true;

            
            this.startPos = this.pos;
    
            let dist = this.pos.distance(pos);
    
          
    
            start = false;
            let aniFunc = undefined;
            if(start)aniFunc = makeEaseIn;
        
            this.animation = animate({
                //duration: dur/1.2 ,
                duration: 300,
                timing: function(timeFraction){
                    return Math.pow(timeFraction,2)
                    //return timeFraction;
                },
                draw(progress) {
                    
                    let newPos = self.startPos.moveTowards(self.animationDestination, progress);
                    self.moveTo(newPos);
                //   console.log(progress);
                },
                completed(){
                    self.animating = false;
                    if(path.length>0){
                        //console.log("here");
                        
                        self.moveToPath(path, false, id);
                        
                    }else{
                     //   console.log("done going to "+pos)
                    }
                }
            }, makeEaseInOut);

        }
       // this.animation.id = id;
         
        if(this.animating){
        //check if animation has been cancelled
            
            if( pos.distance(this.animationDestination) > 10){
                /*
                start = false;
                self = this;
                this.getAnimation().stop();
                this.animationDestination = pos; 
                self.startPos = pos;
                animate({
                    duration: 100 ,
                    timing: function(timeFraction){
                        //return Math.pow(timeFraction,2)
                        return timeFraction;
                    },
                    draw(progress) {
                        
                        let newPos = self.startPos.moveTowards(pos, progress);
                        self.moveTo(newPos);
                    //   console.log(progress);
                    },
                    completed(){
                        an();
                    }
                }, undefined);*/
                //animate();
            }else{
                return;
            }
        
        }
      
        an();
    }
        
        
    }
    

 

class MouseInput extends Action{
    
    constructor(data){
        super(data);
        this.unDoable = false;
    }

    execute(reliable){
        let mouse = mice[this.data.displayName];
        let pos = new Vector2(this.data.pos);
        
        if(mouse===undefined){
            mice[this.data.displayName] = new Mouse(pos, this.data.displayName);
        }else{
            mouse.moveToPath([pos]);
        }
    }

}




function basic(timeFraction) {
    return timeFraction;
}


let mouse = null;
let mousePathList = [];

let lastPos = null;

function flushMouseInputs(){
    //mouse.moveToPath(mousePathList);
  
    app.commit({
        action: "MouseInput",
        pos: mousePathList[0].toJSON(),
        displayName: "Marc",
        broadcastSelf: false
    })
    mousePathList = [];
}

let mice = {};
let firstMouseInput = true;
canvas.addEventListener("mousemove", (e) => {

    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
    
    let currentPos = getMousePos();
    let flushTime = 0;
    let restingFlushTime = 0;
    if(firstMouseInput){
    //  mouse = new Mouse(currentPos, "Marc");
        //mouse = new Mouse(currentPos, "Marc");
       
    
        lastPos = currentPos;
      
        firstMouseInput = false;
        
        let resting =false; 
        setInterval(()=>{

            flushTime++;
            restingFlushTime++;
            if((flushTime>=30 && resting) || flushTime == 100){
                if(lastPos.distance(getMousePos())>10){
                    mousePathList.push(getMousePos())
                    flushMouseInputs();
                    lastPos = getMousePos();

                    restingFlushTime = 0;
                    flushTime = 0;
                    resting =false;
                }
                
            }
            if(restingFlushTime>10 && !resting){
                
                resting = true;
              //  console.log("REST!")
            }
    
        },10);

        
        
    }else{
   
        restingFlushTime = 0;

    }

    
});



document.addEventListener("keydown", (e) => {
    console.log(e.key);
    if(e.key==" "){
        //mouse.animation.stop();
        //mouse.moveToPath([mousePathList[mousePathList.length-1]], true);
        //mousePathList = [];
        mouse.getAnimation().stop();
        console.log(mouse.this);
    }

    if(e.key=="f"){
        //mouse.animation.stop();
        //mouse.moveToPath([mousePathList[mousePathList.length-1]], true);
        //mousePathList = [];
       // mouse.animation.stop();
        mouse.moveToPath(mousePathList);
        mousePathList = [];
    }
});


function randColor(){
    return '#'+Math.round(0xffffff * Math.random()).toString(16);
}

function replayMousePos(){
    
}
