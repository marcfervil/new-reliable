//is mightier than the sword
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
        //this.drawRect.setAttribute("width", size.x); 
        //this.drawRect.setAttribute("height", size.y); 
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
      
        $(this.drawRect).remove();
    }
}


class Select extends Action{

    constructor(data){
        super(data);
    }

    execute(reliable){
        super.execute(reliable);
       
    }

    undo(){
        
    }

}
