//is mightier than the sword
class Pan extends Tool{

    constructor(){
        super("Pan");
    }

    getImage(){
        return "pan2.svg";
    }

    canvasDragStart(pos){
        this.dragStart = pos.divide(zoom);

    }

    canvasDrag(pos){
        let deltaDrag = pos.divide(zoom).subtract(this.dragStart);
       
        $(canvas).css( 'left', `+=${deltaDrag.x}px` );
        $(canvas).css( 'top', `+=${deltaDrag.y}px` );
        //console.log(deltaDrag)
    }

    canvasDragEnd(){
       
    
    }
}
