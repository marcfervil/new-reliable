
class Tool {


   
    constructor(name, img){
        
        this.name = name;
        this.img = img;
       
        this.canvas = undefined;
      
    }

    initCanvas(canvas){
        this.canvas = canvas;
       
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
        console.log("Pen Down at "+pos)
    }

    canvasDrag(pos){
        console.log("Drag to "+ pos)
    }

    canvasDragEnd(){
        console.log("Drag ended");
    }



}