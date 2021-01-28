

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
    
    moveToPath(path, start=true, id=Reliable.makeId(5) ){
     //   console.log(path.size)

       // console.log(pathDist);
       let pos = path.splice(0, 1)[0]
       if(pos===undefined)return;
      

        let an = () =>{
            let self = this;

            this.animationDestination = pos; 
            this.animating = true;

            
            this.startPos = this.pos;
    
            let dur = this.pos.distance(pos);
    
            if(dur==0)dur = 1;
    
            start = false;
            let aniFunc = undefined;
            if(start)aniFunc = makeEaseIn;
        
            //if(speed!==undefined) dur = 
            console.log("moving to "+pos);
            //console.log(this.pos.distance(pos))
            this.animation = animate({
                //duration: dur/1.2 ,
                duration: 400,
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
                        console.log("done going to "+pos)
                    }
                }
            }, makeEaseInOut);

        }
       // this.animation.id = id;
         
        if(this.animating){
        //check if animation has been cancelled
        
            if( pos.distance(this.animationDestination) > 10){
 
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
                        animate();
                    }
                }, undefined);
            }else{
                return;
            }
        
        }
      
        an();
    }
        
        
    }
    

   




function basic(timeFraction) {
    return timeFraction;
}

canvas.addEventListener("mousedown", (e) => {
    x=true;
});
let mouse = null;
let mousePathList = [];
let flushMouseInputs = -1;
let lastPos = null;
canvas.addEventListener("mousemove", (e) => {

    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
    
    let currentPos = getMousePos();
   
    if(mouse==null){
        mouse = new Mouse(currentPos);
        console.log("here?");
    
        lastPos = currentPos;
       // setInterval(()=>{
          //  mouse.moveToPath([getMousePos()],true);
        //}, 1000);
        //mousePathList = [currentPos];
        
        
        
        setInterval(()=>{
           /*
            if(mousePathList.length>0 && mousePathList.last().distance(getMousePos())>50){
                console.log("added");
                console.log(mousePathList.last().distance(currentPos));
                mousePathList.push(getMousePos());
            }*/
            console.log(lastPos.distance(getMousePos()));
            if(lastPos.distance(getMousePos())>10){
                mousePathList.push(getMousePos());
                console.log(mousePathList.last())
                mouse.moveToPath(mousePathList);
                lastPos = getMousePos();
                mousePathList = [];
            }
        /*    
            //console.log(mousePathList.length+"  ,  "+flushMouseInputs+"   ,   "+mousePathList.last().distance(currentPos)+"    ,    "+Math.abs(flushMouseInputs-performance.now()));
            if(mousePathList.length > 10){
               
               // mouse.moveToPath(mousePathList);
                mouse.moveToPath(mousePathList);
                mousePathList = [getMousePos()];
                
            }else if(flushMouseInputs==-1){
                flushMouseInputs = performance.now();
            }else if(mousePathList.length> 0 && Math.abs(flushMouseInputs-performance.now())> 100){ 
                if(mousePathList.length>1){
               mousePathList.push(currentPos)
                mouse.moveToPath(mousePathList);
                mousePathList = [];
                flushMouseInputs = -1;
                }
            }*/
        },300);

        
        
    }else{
      //  console.log(currentPos);
      
      /*
        if(lastPos.distance(currentPos)>200){
            mousePathList.push(getMousePos());
            console.log(mousePathList.last())
            mouse.moveToPath(mousePathList);
            lastPos = currentPos;
            mousePathList = [];
        }*/
        /*
        if(startPos.distance(currentPos) > 400){
            startPos = currentPos
            mousePathList.push(getMousePos());
         //   mousePathList.push()
        }*/
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
