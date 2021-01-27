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

    
    
    moveToPath(path, last){
        //if(start!==undefined)this.moveTo(start);
        //path = [this.pos].concat(path);
        //console.log(path.length);
        let pos = path.splice(0, 1)[0]
        if(this.animating){
            //check if animation has been cancelled
            if(pos.distance(this.animationDestination) < 10)return;
            this.animation.stop();
            
        }
        this.animationDestination = pos; 
        this.animating = true;
       // console.log(path.length);
        let self = this;
        let startPos = this.pos
   
        //console.log(pos);
        let dur = this.pos.distance(pos)/0.7;
       // console.log("last: "+last)
        if(dur==0)dur = 1;
        this.animation = animate({
            duration: dur  ,
            timing: function(timeFraction){
                return  Math.pow(timeFraction, 2)
                
            },
            draw(progress) {
                let dest = startPos.moveTowards(pos, progress);
                self.moveTo(dest);
            
            },
            completed(){

                if(path.length>0){
                    //console.log("here");
                    self.moveToPath(path);
                }else{
                    self.animating = false;
                }
            }
        });
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

canvas.addEventListener("mousemove", (e) => {

    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
    
    currentPos = getMousePos();

    if(mouse==null){
        mouse = new Mouse(getMousePos());
        console.log("here?")
        setInterval(()=>{
            mouse.moveToPath([getMousePos()],true);
        }, 1000);
        
    }

    
});

document.addEventListener("keydown", (e) => {
    console.log(e.key);
    if(e.key==" "){
        console.log(mouse.animation);
        mouse.animation.stop();
    }
});


function randColor(){
    return '#'+Math.round(0xffffff * Math.random()).toString(16);
}

function replayMousePos(){
    
}
