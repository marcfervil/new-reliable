

class Mouse{

    constructor(pos){
        this.pos = pos;
        let svg = document.createElementNS("http://www.w3.org/2000/svg", 'image');
        svg.setAttribute("x", this.pos.x);
        svg.setAttribute("y", this.pos.y);
        svg.setAttribute("width", "40");
        svg.setAttribute("height", "40");
        svg.setAttribute("href", path+"/images/icons/point2.svg");
        canvas.appendChild(svg);
        this.svg = svg;
        this.animating = false;
        this.queue=[];
    }

    moveTo(pos){
        this.pos = pos;
        this.svg.setAttribute("x", this.pos.x);
        this.svg.setAttribute("y", this.pos.y);
    }

    /*
    https://javascript.info/js-animation
    lerpTo(lerp){

        if(this.animating){
            this.queue.push(lerp);
            return;
        }
        
        let self = this;
        let startPos = this.pos;
        this.animating = true;
        animate({
            duration: lerp.dur/4,
            timing(timeFraction) {
                return timeFraction
            },
            draw(progress) {
                let dest = startPos.moveTowards(lerp.pos, progress);
                self.moveTo(dest);
            
            },
            completed(){
               
                self.animating = false;
                if(self.queue.length>0){
                    self.lerpTo(self.queue.splice(0,1)[0]);
              
                }
            }
        });
    }*/

    getAnimation(){
        return this.animation;
    }
    
    moveToPath(path, start=true, id=Reliable.makeId(5)){
        //if(start!==undefined)this.moveTo(start);
        //path = [this.pos].concat(path);
        //console.log(path.length);
        let pos = path.splice(0, 1)[0]
        if(pos===undefined)return;
        if(this.animating){
            //check if animation has been cancelled
            
            if( pos.distance(this.animationDestination) > 10){
                //this.animationDestination = pos; 
                //this.startPos = this.pos;
             
                //this.animation.resetTime();
                this.getAnimation().stop();
                
            }else{
                return;
            }
            //this.animation.stop();
           
        }
        
        this.animationDestination = pos; 
        this.animating = true;
       // console.log(path.length);
        let self = this;
        this.startPos = this.pos;
   
        //console.log(pos);
        let dur = this.pos.distance(pos)/0.8;
       
       // console.log("last: "+last)
        if(dur==0)dur = 1;
        if(start)console.log("staring animation "+id);
        
        this.animation = animate({
            duration: dur  ,
            timing: function(timeFraction){
                return  timeFraction;
                
            },
            draw(progress) {
                
                let newPos = self.startPos.moveTowards(self.animationDestination, progress);
                self.moveTo(newPos);
            
            },
            completed(){
                self.animating = false;
                if(path.length>0){
                    //console.log("here");
                    
                    self.moveToPath(path, false, id);
                    
                }
            }
        });
        this.animation.id = id;
    }


}


function basic(timeFraction) {
    return timeFraction;
}
function makeEaseOut(timing) {
    return function(timeFraction) {
      return 1 - timing(1 - timeFraction);
    }
  }

canvas.addEventListener("mousedown", (e) => {
    x=true;
});
let mouse = null;
mousePathList = [];
canvas.addEventListener("mousemove", (e) => {

    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
    
    currentPos = getMousePos();

    if(mouse==null){
        mouse = new Mouse(getMousePos());
        console.log("here?");
        startPos = getMousePos();
       
       // setInterval(()=>{
          //  mouse.moveToPath([getMousePos()],true);
        //}, 1000);
        setInterval(()=>{
           
            if(mousePathList.length > 0){
               
               // mouse.moveToPath(mousePathList);
                mouse.moveToPath(mousePathList);
                mousePathList = [];
            }
        },500);
        
    }else{
        if(startPos.distance(currentPos) > 20){
            startPos = currentPos
            mousePathList.push(getMousePos());
         //   mousePathList.push()
        }
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
