class SVGText extends SVG{

    constructor(parent, pos, id, text){
        //super("foreignObject", parent, pos, id);
       // this.text = text;


        /*
        let textNode = document.createTextNode(this.text);
        this.span = $("<span/>").attr("class", "SVGInput nohighlight");
        this.span.append(textNode);
 
       //professor: Some of you clearly waited unitl the last minute to do this assignment 
        
        $(this.svg).append(this.span);
      
        this.svg.setAttribute("width", this.span.innerWidth());
        this.svg.setAttribute("height", this.span.innerHeight());
        this.svg.setAttribute("x", pos.x);
        this.svg.setAttribute("y", pos.y);

        //for some reason the selection can't pick up foreignObject...but it can pick up an invisible rectange
        let boundRect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        boundRect.setAttribute("width", this.span.innerWidth());
        boundRect.setAttribute("height", this.span.innerHeight());
        boundRect.setAttribute("x", pos.x);
        boundRect.setAttribute("y", pos.y);
        boundRect.setAttribute("fill", "transparent");
        this.group.appendChild(boundRect)*/

        
        
        
   //     DO NOT DELETE - WILL USE WHEN TURNING foreignObject INTO IMAGE
     //   I don't use the the "text" SVG element because the scaling is weird and it introduces lag??

        super("text", parent, pos, id)
        this.text = text;
        let textNode = document.createTextNode(this.text);
        this.svg.setAttribute("text-anchor", "middle");
        this.svg.setAttribute("class", "SVGInput");
        this.svg.appendChild(textNode);
        


        this.moveTo(pos);
    
    }

    //https://javascript.info/js-animation

    /*
    scaleTo(scale, anchorX, anchorY){
        let self = this;
        animate({
            duration: 1000,
            timing(timeFraction) {
                if (timeFraction < .5)
                  return timing(2 * timeFraction) / 2;
                else
                  return (2 - timing(2 * (1 - timeFraction))) / 2;
              },
            draw(progress) {
                self.svg.setAttribute("x", self.pos.x + (progress * 100));
             
            }
        });
    }*/


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