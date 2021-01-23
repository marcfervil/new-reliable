class SVGGroup extends SVG{

    constructor(parent, pos, id, children){
        super("g", parent, pos, id);
        
        for(let child of children){
            this.svg.appendChild(child.svg);
          //  child.select();
           // child.moveTo(child.transform.pos)
            child.delete();
        }

        //for some reason the selection can't pick up foreignObject...but it can pick up an invisible rectange
        let boundRect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        let rect = this.svg.getBoundingClientRect();
        boundRect.setAttribute("width", rect.width);
        boundRect.setAttribute("height", rect.height);
        boundRect.setAttribute("x",rect.x);
        boundRect.setAttribute("y",rect.y);
        boundRect.setAttribute("fill", "transparent");

        boundRect.setAttribute("id", this.id+"-bounds");
       
        this.group.appendChild(boundRect)

        
        


      //  this.moveTo(pos);
        this.select(app);
    }


    getSerializableProperties(){
        return [];
    }

    
    

}
 
