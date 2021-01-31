

class SVGGroup extends SVG{

    constructor(parent, pos, id, childrenData){
        super("g", parent, pos, id);
        

        this.children = [];
     
        this.childrenData = childrenData;
        for(let childData of childrenData){
    
            //TODO pass in actual reliabe ref 
           
            //delete og child and create new children based on serialized data
            let oldSVG = SVG.getFromId(childData.id)
            if(oldSVG!==undefined){
                app.removeSVG(oldSVG);
                oldSVG.delete();
            }
            app.setState([childData], this.svg, false);

            this.children.push(SVG.getFromId(childData.id));
            //this.svg.appendChild(child.group);
           // child.delete();
           //  child.moveTo(child.transform.pos);
            //console.log(child.group);
        }

    
        //this.initPos = rect
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

        //this.children = children;
        
     

        this.moveDelta = new Vector2(0, 0);
        this.initPos = new Vector2(rect.x, rect.y);
        this.scaleDelta = new Vector2(0, 0);
      //  this.moveTo(pos);
       
    }
    
    getSelectMargin(){
        return 0;
    }

    moveTo(pos){
        super.moveTo(pos);
        this.moveDelta = this.pos.subtract(this.initPos);

        //move delta x & y
        this.svg.setAttribute("mdx", this.moveDelta.x);
        this.svg.setAttribute("mdy", this.moveDelta.y);
        
       // console.log(this.pos);
    }

    scaleTo(scale, anchorX, anchorY){

       
        super.scaleTo(scale, anchorX, anchorY);
    
        
        this.scaleDelta = this.transform.scale.subtract(new Vector2(1, 1))
        this.svg.setAttribute("mdsx", this.scaleDelta.x);
        this.svg.setAttribute("mdsy", this.scaleDelta.y)
        this.svg.setAttribute("mdsxa", anchorX);
        this.svg.setAttribute("mdsya", anchorY);
    }

    getSerializableProperties(){
       
        return ["childrenData"];
    }

    unselect(reliable){
        super.unselect(reliable);
        
       // console.log(this.scaleDelta)
        for(let child of this.children){
            let childRect = child.group.getBoundingClientRect();
            let childpos = new Vector2(childRect.x, childRect.y);

            let newMatrix = child.matrix.multiply(this.matrix)

            reliable.canvas.appendChild(child.group);
           
           
 
           
            child.scaleTo(new Vector2(newMatrix.a, newMatrix.d), "left", "top");
            child.moveTo(childpos);
        }
        this.delete();
        console.log("\n");
    }
    

}
 
