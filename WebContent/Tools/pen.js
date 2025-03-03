//Self documenting:
//is mightier than the sword
class Pen extends Tool{

    constructor(){
        super("Pen");
    }

    rectTest(){
    
    }

    getImage(){
        return "draw2.svg";
    }

    canvasDragStart(pos){
        this.svgPath = new SVGPath(this.reliable.canvas, pos);

    }

    canvasDrag(pos){
        
        this.svgPath.addPoint(new Vector2(pos.x, pos.y));
    }

    //
    canvasDragEnd(){
       
        let smoothed = this.svgPath.smoothify();
        //smootify may return false if the path was too small...we don't want tiny invisible paths 
        
        if(smoothed){  
            Action.commit(this.reliable, {
                action: "Draw",
                id: this.svgPath.id,
                path: this.svgPath.pathData,
                color: "#AAB2C0",
                pos: {
                    x: this.svgPath.pos.x,
                    y: this.svgPath.pos.y,
                }
            });   
        }
        //TODO: Delete double path
        this.svgPath.delete();
    }
}


class Draw extends Action{

    constructor(data){
        super(data);
        this.pos = new Vector2(this.data.pos.x, this.data.pos.y);
    }


    
    /**@override */
    execute(reliable){
        super.execute(reliable);
        //this.svgPath = new SVGPath(reliable.canvas, new Vector2(),this.data.id);
        
        this.svgPath = new SVGPath(reliable.canvas, this.pos, this.data.id, this.data.path);

       // this.svgPath.replacePath(this.data.path);
        this.svgPath.svg.style.stroke = this.data.color;

        reliable.addSVG(this.svgPath);

        if(this.data.transform != null){
            this.svgPath.matrix = this.data.transform;
            this.svgPath.updateTransform()
        }
        //console.log("svgPath ", this.svgPath)


    }

    
    undo(){
        this.reliable.removeSVG(this.svgPath);
        this.svgPath.delete();
    }

}
