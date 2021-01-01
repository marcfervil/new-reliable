
//https://yqnn.github.io/svg-path-editor/
let isDragging = false;

function bringToTop(targetElement){
    // put the element at the bottom of its parent
    let parent = targetElement.parentNode;
    parent.appendChild(targetElement);
  }


function makeDraggable(element, liveshare, color){
    //element.mouseDown = 0;
    //

    element.pos = new Vector2(0, 0);



    let mouseMove = function(e) {
        if(element.mouseDown==1){
            let deltaX = e.offsetX - element.start.x;
            let deltaY = e.offsetY - element.start.y;
            let delta = new Vector2(deltaX, deltaY);
            //console.log(delta);
            element.newpos = element.pos.add(delta);
            element.setAttribute('transform',`translate(${element.newpos.x }, ${element.newpos.y})`);
        }
    }

    let mouseUp = function(e) {
        if(element.mouseDown == 0)return;
        isDragging = false;
        //element.style.zIndex = "0";
    
        element.mouseDown = 0;
        element.pos = element.newpos;
       document.removeEventListener('mousemove', mouseMove);
       document.removeEventListener('mouseup', mouseUp);
       if(color)element.firstChild.style.stroke = "#AAB2C0";
    }

    element.onmousedown = function(e) { 
        
        //if(color)element.firstChild.style.stroke = "green";
        

        element.start = {x: e.offsetX, y:e.offsetY};
        element.offset = {x: e.layerX, y:e.layerY};


        element.mouseDown = 1;
 
        isDragging = true; 

        document.addEventListener('mouseup', mouseUp);
        document.addEventListener('mousemove', mouseMove);
    


        /*
        let bounds = element.getBoundingClientRect();
        let testRect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        
        element.parentNode.appendChild(testRect);
       
        testRect.setAttribute('x', bounds.x);
        testRect.setAttribute('y', bounds.y);
        testRect.setAttribute('width', bounds.width);
        testRect.setAttribute('height', bounds.height);
        testRect.style.stroke = "green";
        testRect.style.fill="transparent"
        
        bringToTop(element);*/
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


 
/*
class ImageSVG extends SVG{
    constructor(parentId, pos, src){
        this.pos = pos;
        this.parentId = parentId;
        this.src = src;
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", 'image');
        
        this.parent = $("#"+this.parentId)[0];
        this.parent.appendChild(this.svg);

        this.svg.setAttribute('transform',`translate(${pos.x}, ${pos.y})`);
        this.svg.setAttributeNS('http://www.w3.org/1999/xlink','href', this.src);

        
        makeDraggable(this.svg, true, false);


    }
    

    delete(){
        $(this.svg).remove();
    }

}*/
