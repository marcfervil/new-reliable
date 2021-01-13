class SVGText extends SVG{

    constructor(parent, pos, id, text){
        super("text", parent, pos, id)
        this.text = text;
    
        let textNode = document.createTextNode(this.text);
        //this.textNode.setAttribute();
        this.svg.setAttribute("class", "SVGInput");
        this.svg.appendChild(textNode);
        this.moveTo(pos);
    
    }


    getSerializableProperties(){
        return ["text"];
    }



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