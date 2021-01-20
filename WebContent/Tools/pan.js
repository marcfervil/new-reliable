

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
            
            if(e.ctrlKey){
                this.zoom((e.deltaY) * 0.01);
                
            }else{
                this.pan(new Vector2(-e.deltaX, -e.deltaY).multiply(zoom));
                //window.requestAnimationFrame(()=>{this.pan(new Vector2(-e.deltaX, -e.deltaY).multiply(zoom))});
            }
            //somebody tell me if this is dumb
            this.timer = setTimeout(() => {
                this.scolled-=1;
                if(this.scolled<=0){
                    this.reliable.swapTool(this.lastTool);
                    
                }
            }, 200);
           
        };
        


        document.addEventListener('keydown', (event)=> {
            if(event.key === '='){
  
                
                this.zoom(-.5);
             
                
            }
            if(event.key === '-'){
  
                
                this.zoom(.5);
                
                
            }
    
        });

    }

    getImage(){
        return "pan2.svg";
    }

    canvasDragStart(pos){

        

        this.dragStart = pos.divide(zoom);

    }

    zoom(zoomFactor){
        const maxZoom = 0.2;
       
        let deltaZoom = new Vector2(zoomFactor, zoomFactor);
       
       
        let w = document.documentElement.clientWidth;
        let h = document.documentElement.clientHeight;

        let center = new Vector2((w/2), (h/2));

        let mouseOffset = mousePos.multiply(zoom).subtract(center);

        let centerMouse = center.add(mouseOffset).add(pan);
        //this.debugRect(centerMouse.x, centerMouse.y, 10, 10, "red");
        
        
   
        zoom = zoom.add(deltaZoom);

        if(zoomFactor < 0 && zoom.x < maxZoom){
            zoom = new Vector2(maxZoom, maxZoom);

            return;
        }

        this.updateView();
        this.centerPan(centerMouse);
    }

    centerPan(delta){

 

        let w = document.documentElement.clientWidth/2;
        let h = document.documentElement.clientHeight/2;

        let centerScreen = new Vector2(w, h).multiply(zoom);

        let panPos = delta.scale(-1).add(pan).add(centerScreen);
        let mouseOffset = mousePos.multiply(zoom).subtract(centerScreen);
       
        this.pan(panPos.add(mouseOffset), true);

    }

    updateView(){
        canvas.setAttribute("viewBox", `${pan.x} ${pan.y} ${canvas.clientWidth*zoom.x} ${canvas.clientHeight*zoom.y}`);
    }

    pan(delta, hard){
        //if(hard==true){
        //    pan = delta.scale(1);
        //}else{
      

        //console.log(document.documentElement.clientWidth + pan.y);
        console.log();
//        
       // if(pan.y + document.documentElement.clientWidtht > 5000)delta.y =0;
        pan = pan.subtract(delta);
     
        if(delta.x> 0 && pan.x<0)pan.x = 0;
        if(delta.y> 0 && pan.y<0)pan.y = 0;
        
        //infinite scroll lol
        //if(delta.y< 0 && pan.y + document.documentElement.clientWidth > 5000) pan.y = pan.y - document.documentElement.clientWidth;
        
        if(delta.y< 0 && pan.y + document.documentElement.clientHeight > 5000) pan.y = 5000 - document.documentElement.clientHeight;
        if(delta.x < 0 && pan.x + document.documentElement.clientWidth > 5000) pan.x = 5000 - document.documentElement.clientWidth;


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
