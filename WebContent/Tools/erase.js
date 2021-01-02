//eraser tool for erasing.

class Eraser extends Tool{

    constructor(){
        super("Eraser", "images/eraser.svg");
    }


    canvasDragStart(pos){
        this.svgRect = new SVGPointer(this.reliable.canvas, pos)
        //this.svgPath = new SVGPath(this.reliable.canvas, pos);

    }

    canvasDrag(pos){
        this.svgRect.updateLocation(new Vector2(pos.x, pos.y));
    }

    canvasDragEnd(){
        this.svgRect.delete();
       


    }
}

