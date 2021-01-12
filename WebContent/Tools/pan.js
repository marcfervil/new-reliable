class Pan extends Tool{

    constructor(){
        super("Pan");
        this.scolled = 0;
   
        window.onwheel = (e)=> {
            
            if(this.scolled ==0 )this.lastTool = this.reliable.getCurrentTool();
            this.scolled += 1;

            this.reliable.swapTool(this);
            this.pan(new Vector2(-e.deltaX, -e.deltaY));
            
            //somebody tell me if this is dumb
            this.timer = setTimeout(() => {
                this.scolled-=1;
                if(this.scolled<=0){
                    this.reliable.swapTool(this.lastTool);
                    
                }
            }, 100);
          
            
        };
    }

    getImage(){
        return "pan2.svg";
    }

    canvasDragStart(pos){
        this.dragStart = pos.divide(zoom);

    }

    pan(delta){
        $(canvas).css( 'left', `+=${delta.x}px` );
        $(canvas).css( 'top', `+=${delta.y}px` );
    }

    canvasDrag(pos){
        let deltaDrag = pos.divide(zoom).subtract(this.dragStart);

        this.pan(deltaDrag)
    }

    canvasDragEnd(){
       
    
    }
}
