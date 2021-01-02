class Selection extends Tool{

    constructor(){
        super("Selection", "images/selection");
       
    }


    canvasDragStart(pos){
 
        this.mouseStart = pos;
        this.drawRect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');


        this.drawRect.setAttribute("width", 1); 
        this.drawRect.setAttribute("height", 1); 
        this.drawRect.setAttribute("fill", "#45B0F5");
        this.drawRect.setAttribute("fill-opacity", "20%");
        this.drawRect.setAttribute("stroke-width", "1");
        this.drawRect.setAttribute("stroke", "#45B0F5");
        this.drawRect.setAttribute("vector-effect", "non-scaling-stroke");
        

        this.reliable.canvas.appendChild(this.drawRect);
        this.setDragRect(pos, new Vector2(1,1));
    }

    setDragRect(pos, size){
 
        this.drawRect.setAttribute("stroke-width", "1");
        this.drawRect.setAttribute("transform", `translate(${pos.x}, ${pos.y}) scale(${size.x}, ${size.y})`);
       
    }


    canvasDrag(pos){
        let dist = this.mouseStart.subtract(pos);
        let scaleFlip = dist.scale(-1);
        //dist = new Vector2(Math.abs(dist.x), Math.abs(dist.y));
        this.setDragRect(this.mouseStart, scaleFlip);
       
    }

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
}


class Select extends Action{

    constructor(data){
        super(data);
    }

    execute(reliable){
        super.execute(reliable);

        for(let id of this.data.ids){
            $(`#${id}`)[0].reliableSvg.select(this.myAction);
        }
    }

    undo(){
        
    }

}
