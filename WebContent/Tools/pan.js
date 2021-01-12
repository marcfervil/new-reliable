

class Pan extends Tool{



    debugRect(x, y, w, h, color){
        let debug = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        debug.setAttribute("x", x);
        debug.setAttribute("y", y);
        debug.setAttribute("width", w);
        debug.setAttribute("height", h);
        debug.style.stroke = color;
        debug.style.zIndex = 1000;
        debug.style.fill = "transparent";
        canvas.appendChild(debug);
        return debug;
    }

    constructor(){
        super("Pan");
        this.scolled = 0;
        this.panVal = new Vector2(0, 0);
        window.onwheel = (e)=> {
            
            if(this.scolled ==0 )this.lastTool = this.reliable.getCurrentTool();
            this.scolled += 1;

            this.reliable.swapTool(this, false);
            this.pan(new Vector2(-e.deltaX, -e.deltaY));
            
            //somebody tell me if this is dumb
            this.timer = setTimeout(() => {
                this.scolled-=1;
                if(this.scolled<=0){
                    this.reliable.swapTool(this.lastTool);
                    
                }
            }, 200);

        };



        document.addEventListener('keydown', (event)=> {
            if(event.key === 'f'){
  
                zoom = new Vector2(0.5, 0.5);
                canvas.setAttribute("viewBox", `0 0 ${canvas.clientWidth*zoom.x} ${canvas.clientHeight*zoom.y}`);


                //let deltaX = -parseInt(canvas.style.left.substr(0, canvas.style.left.length-2)) ;
                //let deltaY = -parseInt(canvas.style.top.substr(0, canvas.style.top.length-2)) 
          
                //canvas.setAttribute("viewBox", `${deltaX} ${deltaY} ${canvas.clientWidth*0.5} ${canvas.clientHeight*0.5}`);
                
                //

                //let offset = new Vector2(-(canvas.clientWidth*zoom.x)/2, -(canvas.clientHeight*zoom.y)/2);
                let cx = parseInt(canvas.style.left.substr(0, canvas.style.left.length-2)) ;
                let cy = parseInt(canvas.style.top.substr(0, canvas.style.top.length-2)) ;
                let canvasOffset = new Vector2(-cx, -cy);
                let canvasBounds = canvas.getBoundingClientRectOld();

                //let dist = mousePos.subtract(new Vector2((screen.width/2),(screen.height/2).add()));
                //console.log(canvas.clienrtX+(canvas.clientWidth));

                let w = document.body.clientWidth;
                let h = document.documentElement.clientHeight;

                let center = new Vector2((w/2)-cx, (h/2)-cy);

                let mouseOffset = mousePos.multiply(zoom).subtract(new Vector2(cx, cy)).subtract(center);

                let centerMouse = center.add(mouseOffset);
                this.debugRect(centerMouse.x, centerMouse.y, 10, 10, "red");

//                this.centerPan(centerMouse);

             
    
            }
    
        });

    }

    getImage(){
        return "pan2.svg";
    }

    canvasDragStart(pos){

        

        this.dragStart = pos.divide(zoom);

    }

    centerPan(delta){

 

        let w = document.body.clientWidth/2;
        let h = document.documentElement.clientHeight/2;

        let centerScreen = new Vector2(w, h);

        this.pan(delta.scale(-1).add(centerScreen), true);

    }

    pan(delta, hard){
        
        pan = pan.subtract(delta);
        canvas.setAttribute("viewBox", `${pan.x} ${pan.y} ${canvas.clientWidth*zoom.x} ${canvas.clientHeight*zoom.y}`);
        
        /*
        if(hard==true){
            $(canvas).css( 'left', `${delta.x}px` );
            $(canvas).css( 'top', `${delta.y}px` );
        }else{
            $(canvas).css( 'left', `+=${delta.x}px` );
            $(canvas).css( 'top', `+=${delta.y}px` );
        } */
    }

    canvasDrag(pos){
        let deltaDrag = pos.divide(zoom).subtract(this.dragStart);

        this.pan(deltaDrag)
    }

    canvasDragEnd(){
       
    
    }
}
