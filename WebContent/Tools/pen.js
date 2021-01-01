//is mightier than the sword
class Pen extends Tool{

    constructor(){
        super("Pen", "images/pen.svg");
    }


    canvasDragStart(pos){
        this.svgPath = new SVGPath(this.reliable.canvas, pos);

    }

    canvasDrag(pos){
        this.svgPath.addPoint(new Vector2(pos.x, pos.y));
    }

    canvasDragEnd(){
        this.svgPath.smoothify();
        Action.commit(this.reliable, {
            action: "Draw",
            id: this.svgPath.id,
            path: this.svgPath.pathData,
            color: "#AAB2C0"
        });   
        this.svgPath.delete();

    }
}

class RedPen extends Pen{

    canvasDragStart(pos){
        this.svgPath = new SVGPath(this.reliable.canvas, pos);
        this.svgPath.svg.style.stroke = "red";
    }

    canvasDragEnd(){
        this.svgPath.smoothify();
        Action.commit(this.reliable, {
            action: "Draw",
            id: this.svgPath.id,
            path: this.svgPath.pathData,
            color: "red"
        });   
        this.svgPath.delete();

    }
}

class Draw extends Action{

    constructor(data){
        super(data);
    }

    execute(reliable){
        super.execute(reliable);
        this.svgPath = new SVGPath(reliable.canvas, new Vector2());
        this.svgPath.replacePath(this.data.path);
        this.svgPath.svg.style.stroke = this.data.color; 
        reliable.svgs.push(this.svgPath);
    }

    undo(){
        this.reliable.svgs.splice(this.reliable.svgs.indexOf(this.svgPath), 1);
        this.svgPath.delete();
    }

}
