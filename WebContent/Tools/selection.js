class Selection extends Tool{

    constructor(){
        super("Selection", "images/selection");
        this.selected = [];

        document.addEventListener('keydown', (event) => {
           
            if (event.keyCode == 8 || event.keyCode == 46 ) {
                Action.commit(this.reliable, {
                    action: "Delete",
                    ids: this.selected
                });
            }
        });
    }

    dectivated(){
        Action.commit(this.reliable, {
            action: "UnSelect",
            ids: this.selected,
        });  
        this.selected = [];
    }

    getImage(){
        return "point2.svg";
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
        /*
        if(this.selected.length > 0) {
            
        
            return;
        }
        */
        let rect = this.drawRect.getBoundingClientRect();
        let svgRect = this.reliable.canvas.createSVGRect();

        svgRect.x = rect.x/zoom.x;
        svgRect.y = rect.y/zoom.y;
        svgRect.width = rect.width/zoom.x;
        svgRect.height = rect.height/zoom.y;
        


        let hits = this.reliable.canvas.getIntersectionList(svgRect, null);

        let unselectList = [...this.selected];

        Action.commit(this.reliable, {
            action: "UnSelect",
            ids: unselectList,
        });  

        this.selected = [];
        
        for(let hit of hits){
            if(hit.parentNode== null || hit.parentNode.reliableSvg===undefined)continue;
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
        //cannot be undone until further notice
        this.unDoable = false;
    }

    execute(reliable){
        super.execute(reliable);

        for(let id of this.data.ids){
            $(`#${id}`)[0].reliableSvg.select(reliable, this.myAction);
            
        }
    }

    undo(){
        
    }

}




class UnSelect extends Action{

    constructor(data){
        super(data);
         //cannot be undone until further notice
         this.unDoable = false;
    }

    execute(reliable){
        super.execute(reliable);

        for(let id of this.data.ids){
            let elements = $(`#${id}`);
            if(elements.length ==0) continue;
            elements[0].reliableSvg.unselect(reliable);
        }
    }

    undo(){
        
    }

}



class Drag extends Action{
    
    constructor(data){
        super(data);
    }

    execute(reliable){

        SVG.getFromId(this.data.id).moveTo(new Vector2(this.data.end));
    }


    undo(){
        let svg = SVG.getFromId(this.data.id);
    //    svg.select();
        svg.moveTo(new Vector2(this.data.start));
    }

}


class Scale extends Action{
    
    constructor(data){
        super(data);
        this.svg = SVG.getFromId(this.data.id);
    }

    execute(reliable){
        this.svg.scaleTo(new Vector2(this.data.end), this.data.anchorX, this.data.anchorY);
    }


    undo(){
      //  this.svg.select();
        this.svg.scaleTo(new Vector2(this.data.start), this.data.anchorX, this.data.anchorY);
    }

}

class Delete extends Action{
    
    constructor(data){
        super(data);
        this.unDoable = false;
        this.saves = [];
        
    }

    execute(reliable){
        this.reliable = reliable;
        SVG.forEachSVG(this.data.ids, (svg) => {
            this.saves.push(svg.serialize());
            reliable.removeSVG(svg);
            svg.delete();
        });
    }


    undo(){
        this.reliable.setState(this.saves);
    }

}





/**for(let id of this.selected){
            
            let svg = $(`#${id}`)[0].reliableSvg
            
            if(!svg.isDragging)unselectList.push(svg.id);
        }
 */
