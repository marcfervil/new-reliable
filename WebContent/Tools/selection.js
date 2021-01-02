class Selection extends Tool{

    constructor(){
        super("Selection", "images/selection");
        this.selected = [];
    }


    canvasDragStart(pos){
 
        /*
        if(this.selected.length > 0) {
            //TODO migtate to multi user unselect action
            for(let id of this.selected){
                let svg = $(`#${id}`)[0].reliableSvg
                
                if(!svg.isDragging){
    
                    svg.unselect();
                }
            }
            this.selected = [];
            return;
        }*/


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
        /*
        if(this.selected.length > 0) {
            
        
            return;
        }
        */
        let rect = this.drawRect.getBoundingClientRect();
        let svgRect = this.reliable.canvas.createSVGRect();

        svgRect.x = rect.x;
        svgRect.y = rect.y;
        svgRect.width = rect.width;
        svgRect.height = rect.height;
        
        let hits = this.reliable.canvas.getIntersectionList(svgRect, null);

        //console.log(this.selected);
        for(let id of this.selected){
            
            let svg = $(`#${id}`)[0].reliableSvg
            
            if(!svg.isDragging){

                svg.unselect();
            }
        }

        this.selected = [];
        
        for(let hit of hits){
            if(hit.parentNode== null)continue;
            let id = hit.parentNode.id;


            if(id != "canvas" && !hit.parentNode.reliableSvg.isSelected){
                this.selected.push(id);
            }
        }



        Action.commit(this.reliable, {
            action: "Select",
            ids: this.selected,
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
