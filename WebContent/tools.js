
class Tool {


   
    constructor(name, img){
        
        this.name = name;
        this.img = img;
       
       
        this.canvas = undefined;
      
    }

  

  
    canvasDragStart(){

    }

    canvasDrag(){

    }

    canvasDragEnd(){

    }


}


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
            data: {
                id: this.svgPath.id,
                path: this.svgPath.pathData
            }
        }, true);
        this.svgPath.delete();
       
    }
}