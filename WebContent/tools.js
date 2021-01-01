class Tool {



    constructor(name, img){
        this.name = name;
        this.img = img;
        this.addTrigger();
    }

    addTrigger(){

    }

    canvasDragStart(){

    }

    canvasDrag(){

    }

    canvasDownEnd(){

    }

    mouseDownCanvas(e){
        this.x = e.layerX;
        this.y = e.layerY;
        element.offset.x = e.layerX;
        element.offset.y = e.layerY;
        element.mouseDown = 1;
        
        if(dragStart!=undefined)dragStart({x: e.layerX, y: e.layerY});
        element.addEventListener('mousemove', mouseMove);
    }

    mouseMoveCanvas(e){
        if(element.mouseDown==1){
            let pos = {x: (e.layerX), y: (e.layerY)};
            dragged(pos);
        }   
    }

    mouseUpCanvas(e){
        if(!isDragging){
            element.mouseDown = 0;
            document.removeEventListener('mousemove', mouseMove);
            dragComplete();
        }
    }

}


function onDrag(element, dragged, dragStart, dragComplete){
    element.mouseDown = 0;
    element.offset = {x: 0, y:0};

    let mouseMove = function(e){
        if(element.mouseDown==1){
            let pos = {x: (e.layerX), y: (e.layerY)};
            dragged(pos);
        }   
    }

    element.onmousedown = function(e) { 
        if(!isDragging){
            element.offset.x = e.layerX;
            element.offset.y = e.layerY;
            element.mouseDown = 1;
            
            if(dragStart!=undefined)dragStart({x: e.layerX, y: e.layerY});
            element.addEventListener('mousemove', mouseMove);
        }
    }
    let mouseUp = function() {
        if(!isDragging){
            element.mouseDown = 0;
            document.removeEventListener('mousemove', mouseMove);
            dragComplete();
        }
    }

    
    element.addEventListener('mouseup', mouseUp);

}

//is mightier than the sword
class Pen extends Tool{

    constructor(){
        super("Pen", "images/pen.svg");
    }

    canvasDrag(){
        SVG.addPoint();
    }

    canvasDragStart(){
        createSvg
    }


}