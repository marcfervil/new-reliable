class SVGImage extends SVG{

    constructor(parent, pos, id, imageData){
        super("image", parent, pos, id)
        this.imageData = imageData;
        this.selectMargin = 0;
        this.svg.setAttribute('href', imageData);
        this.svg.setAttribute("preserveAspectRatio", "xMinYMin meet");


        let box = this.svg.getBBox();
        pos = pos.subtract(new Vector2(box.width/2, box.height/2));
        this.moveTo(pos);
    
    }


    getSerializableProperties(){
        return ["imageData"];
    }


    getSelectMargin(){
        return 0;
    }


}
 

class Image extends Action{

    constructor(data){
        super(data);
        
        this.pos = new Vector2(this.data.pos.x, this.data.pos.y);
    }

    execute(reliable){
        super.execute(reliable);
        //this.svgPath = new SVGPath(reliable.canvas, new Vector2(),this.data.id);
        this.svgImage = new SVGImage(reliable.canvas, this.pos, this.data.id, this.data.image);
       
        reliable.addSVG(this.svgImage);
    }

    undo(){
        this.reliable.removeSVG(this.svgImage);
        this.svgImage.delete();
    }

}