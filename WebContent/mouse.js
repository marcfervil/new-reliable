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

    
    moveToPath(path, start){
        if(start!==undefined)this.moveTo(start);
        //path = [this.pos].concat(path);
        //console.log(path.length);
        this.animating = true;
       // console.log(path.length);
        let self = this;
        let startPos = this.pos
        let lerp = path.splice(0, 1)[0]
        let pos = lerp.pos;
       
        //console.log(pos);
        animate({
            duration: lerp.dur,
            timing(timeFraction) {
                return timeFraction
            },
            draw(progress) {
                let dest = startPos.moveTowards(pos, progress);
                self.moveTo(dest);
            
            },
            completed(){

                if(path.length>0){
                    self.moveToPath(path);
                }else{
                    self.animating = false;
                }
            }
        });
    }


}

let lastMousePos = null;
let mousePosList = [];
let firstPos = null;
let lastTime = null;
mouse = null;
let mouseTime = null;
let totalDist = 0;
let lerpList = [];
let x = true
canvas.addEventListener("mousemove", (e) => {

    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
    
    let currentPos = getMousePos();
    if(lastTime==null){
        lastTime = new Date().getTime()
        
    }
  
    if(lastMousePos==null){
        firstPos = getMousePos();
        
        lastMousePos = currentPos;
        mouse = new Mouse(firstPos);
    }else if( lastMousePos.distance(currentPos) > 0){ 

        totalDist += lastMousePos.distance(currentPos);
        lastMousePos = currentPos;
        let currentTime = new Date().getTime();
        let duration = currentTime - lastTime;
      //  console.log(duration);
        //debugRect(currentPos.x, currentPos.y, 10, 10, "red");
        //console.log(duration/4);
        
        lastTime = currentTime;
        let lerp = {pos: currentPos, dur: duration};
        lerpList.push(lerp);
        //mouse.lerpTo(lerp);
        if(totalDist > 800 && x){
           x = false;
            //for(let i of $(".debug"))i.remove();
            
            let smoothLerp = [];
            let slopeList = [];
            let distList = [];
            let lastPoint = null;
            for(let [i, lerp] of lerpList.entries()){
                if(i > 0 && i<lerpList.length - 1){
                    let last = lastPoint.pos;
                    let cur = lerp.pos;
                    let xSlope = (cur.x - last.x);
                    let ySlope = (cur.y - last.y) ;
                    let slope = ySlope / xSlope;
                    if(Math.abs(slope)==Infinity)slope = 0;
                    let dist = lastPoint.pos.distance(lerp.pos);
                    distList.push(dist);
                    slopeList.push([new Vector2(xSlope, ySlope),slope]);
                    let slopSense = 25;
                    let distToLast = cur.distance(lerpList[lerpList.length-1].pos);
                    let slopeCond = (Math.abs(xSlope) >slopSense || Math.abs(ySlope) >slopSense) && distToLast>200 ;
                    if(slopeCond ){
                        if(slopeCond)console.log("slope")
                        else if(dist>150)console.log("dist");
                        slopeList.push("-----------------------")
                       // console.log(slope>5);
                        //if(slope>)console.log()
                        smoothLerp.push(lerp);
                        lastPoint = lerp;
                    }
                }else{
             
                    smoothLerp.push(lerp);
                    lastPoint = lerp;
                }
            }
            console.log(slopeList);
            console.log(distList);
            for(let lerp of lerpList)debugRect(lerp.pos.x, lerp.pos.y, 10, 10, "red");
            for(let lerp of smoothLerp)debugRect(lerp.pos.x, lerp.pos.y+100, 10, 10, "green");
            
            totalDist = 0;
            lerpList = [];
            mouse.moveToPath(smoothLerp,firstPos);
        }
    }

    /*
    if(mouseTime!=null)clearTimeout(mouseTime);
    mouseTime = setInterval(()=>{  
        
        lastTime = null;
    },100);*/
});



function replayMousePos(){
    
    if(mouse==null) 
    if(mouse.animating)return;
    // /console.log(mousePosList.length);

    mouse.moveToPath(mousePosList);
    mousePosList = [];
}
