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
    
        
        let hits = this.reliable.canvas.getIntersectionList(this.svgRect.svg, null);

        
        let hitIds = [];
        for(let hit of hits)if(hit.parentNode.id != "canvas")hitIds.push(hit.parentNode.id);
        

        //$(this.drawRect).remove();
        this.svgRect.delete();
    }
}

