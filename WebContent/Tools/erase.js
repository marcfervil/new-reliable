//eraser tool for erasing.

class Erase extends Tool{

    constructor(){
        super("Eraser", "images/eraser.svg");
    }


    canvasDragStart(pos){
        this.svgRect = new SVGPointer()
        //this.svgPath = new SVGPath(this.reliable.canvas, pos);

    }

    canvasDrag(pos){
        this.svgPath.addPoint(new Vector2(pos.x, pos.y));
    }

    canvasDragEnd(){
        
        let smoothed = this.svgPath.smoothify();

        if(smoothed){
            Action.commit(this.reliable, {
                action: "Draw",
                id: this.svgPath.id,
                path: this.svgPath.pathData,
                color: "#AAB2C0"
            });   

        } 
        this.svgPath.delete();
    }
}