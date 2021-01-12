

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
  
  
                let cx = parseInt(canvas.style.left.substr(0, canvas.style.left.length-2)) ;
                let cy = parseInt(canvas.style.top.substr(0, canvas.style.top.length-2)) ;
                let canvasOffset = new Vector2(-cx, -cy);
                let canvasBounds = canvas.getBoundingClientRectOld();

                //let dist = mousePos.subtract(new Vector2((screen.width/2),(screen.height/2).add()));
                //console.log(canvas.clienrtX+(canvas.clientWidth));

                let w = document.body.clientWidth;
                let h = document.documentElement.clientHeight;

                let center = new Vector2((w/2), (h/2));

                let mouseOffset = mousePos.multiply(zoom).subtract(center);

                let centerMouse = center.add(mouseOffset).add(pan);
                this.debugRect(centerMouse.x, centerMouse.y, 10, 10, "red");
                
                zoom = new Vector2(1.5, 1.5);
                this.updateView();
                this.centerPan(centerMouse);
    

                
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

 

        let w = document.documentElement.clientWidth/2;
        let h = document.documentElement.clientHeight/2;

        let centerScreen = new Vector2(w, h).multiply(zoom);

        this.pan(delta.scale(-1).add(pan).add(centerScreen), true);

    }

    updateView(){
        canvas.setAttribute("viewBox", `${pan.x} ${pan.y} ${canvas.clientWidth*zoom.x} ${canvas.clientHeight*zoom.y}`);
    }

    pan(delta, hard){
        //if(hard==true){
        //    pan = delta.scale(1);
        //}else{
        
            pan = pan.subtract(delta);
     
        
        this.updateView();
        
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
