class SVGText extends SVG{

    constructor(parent, pos, id, text){
        super("foreignObject", parent, pos, id);
        this.text = text;
        let textNode = document.createTextNode(this.text);
        this.span = $("<span/>").attr("class", "SVGInput");
        this.span.append(textNode);
 
       
        
        $(this.svg).append(this.span);
      
        this.svg.setAttribute("width", this.span.innerWidth());
        this.svg.setAttribute("height", this.span.innerHeight());
        this.svg.setAttribute("x", pos.x);
        this.svg.setAttribute("y", pos.y);

        let boundRect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        boundRect.setAttribute("width", this.span.innerWidth());
        boundRect.setAttribute("height", this.span.innerHeight());
        boundRect.setAttribute("x", pos.x);
        boundRect.setAttribute("y", pos.y);
        boundRect.setAttribute("fill", "transparent");
        this.group.appendChild(boundRect)

        //<rect x="120" width="100" height="100" rx="15" />



        /*

        DO NOT DELETE - WILL USE WHEN TURNING foreignObject INTO IMAGE

        super("text", parent, pos, id)
        this.text = text;
    
        let textNode = document.createTextNode(this.text);
        this.svg.setAttribute("text-anchor", "middle");
        this.svg.setAttribute("class", "SVGInput");
        this.svg.appendChild(textNode);
        this.svg.setAttribute("x", 0);
        this.svg.setAttribute("y", 0);*/


        this.moveTo(pos);
    
    }


    getSerializableProperties(){
        return ["text"];
    }

    /*
    scaleTo(scale, anchorX, anchorY){

    }*/


}
 

class Text extends Action{

    constructor(data){
        super(data);
    }

    execute(reliable){
        super.execute(reliable);
        //this.svgPath = new SVGPath(reliable.canvas, new Vector2(),this.data.id);
        let pos = new Vector2(this.data.pos.x, this.data.pos.y);
        this.svgText = new SVGText(reliable.canvas, pos, this.data.id, this.data.text);
       
        reliable.addSVG(this.svgText);
    }

    undo(){
        this.reliable.removeSVG(this.svgText);
        this.svgImage.delete();
    }

}