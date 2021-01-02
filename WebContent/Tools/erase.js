//eraser tool for erasing.

class Eraser extends Tool{

    constructor(){
        super("Eraser", "images/eraser.svg");
    }


    canvasDragStart(pos){
        this.svgRect = new SVGPointer(this.reliable.canvas, pos)

    }

    canvasDrag(pos){
        this.erase();
        this.svgRect.updateLocation(new Vector2(pos.x, pos.y));
    }


    canvasDragEnd(){
    
        this.erase();
        this.svgRect.delete();
    }
    checkCollisions(){
        let svgRect = this.reliable.canvas.createSVGRect();

        svgRect.x = this.svgRect.pos.x;
        svgRect.y = this.svgRect.pos.y;
        svgRect.width = this.svgRect.size;
        svgRect.height = this.svgRect.size;
        
        let hits = this.reliable.canvas.getIntersectionList(svgRect, null);
        let hitIds = [];
        for(let hit of hits)if(hit.parentNode.id != this.svgRect.id && hit.parentNode.id != "canvas")hitIds.push(hit.parentNode.id);
        console.log(hitIds);
        return hitIds;
    }
    
    eraseOverlap(test){
        console.log(test)
    }
    erase(){
 
        eraseOverlap(checkCollisions());

    }





    /*
    canvasDragEnd(){
      
        
        let rect = this.drawRect.getBoundingClientRect();
        let svgRect = this.reliable.canvas.createSVGRect();

        svgRect.x = rect.x;
        svgRect.y = rect.y;
        svgRect.width = rect.width;
        svgRect.height = rect.height;
        
        let hits = this.reliable.canvas.getIntersectionList(svgRect, null);

        
        let hitIds = [];
        for(let hit of hits)if(hit.parentNode.id != "canvas")hitIds.push(hit.parentNode.id);


        Action.commit(this.reliable, {
            action: "Select",
            ids: hitIds,
        });   


        $(this.drawRect).remove();
    }

    */
}

