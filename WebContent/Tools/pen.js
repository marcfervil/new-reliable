//is mightier than the sword

showSmooth = true;

class Pen extends Tool{

    constructor(){
        super("Pen");
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

    canvasDragEnd(){
        console.log(this.svgPath.path);
        let x = smoothLerp(this.svgPath.path, showSmooth);
        //x.svg.setAttribute("transform","translate(1000,0)")
        this.svgPath.delete();
        //this.svgPath = smoothLerp(this.svgPath.path);
        //this.svgPath2 = new SVGPath(this.reliable.canvas, this.svgPath.pos, Math.random());
        
        //let smoothed = this.svgPath.smoothify();
        
     //   if(true || smoothed){  
         /*
            Action.commit(this.reliable, {
                action: "Draw",
                id: this.svgPath.id,
                path: x.pathData,
                color: "#AAB2C0",
                pos: {
                    x: this.svgPath.pos.x,
                    y: this.svgPath.pos.y,
                }
            });   */
     //   }
       // this.svgPath.delete();
    }
}


class Draw extends Action{

    constructor(data){
        super(data);
        this.pos = new Vector2(this.data.pos.x, this.data.pos.y);
    }

    execute(reliable){
        super.execute(reliable);
        //this.svgPath = new SVGPath(reliable.canvas, new Vector2(),this.data.id);
        this.svgPath = new SVGPath(reliable.canvas, this.pos, this.data.id, this.data.path);

       // this.svgPath.replacePath(this.data.path);
        this.svgPath.svg.style.stroke = this.data.color;
        reliable.addSVG(this.svgPath);
    }

    undo(){
        this.reliable.removeSVG(this.svgPath);
        this.svgPath.delete();
    }

}
