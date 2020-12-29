function makeDraggable(element, liveshare){
    element.mouseDown = 0;
    element.offset = {x: 0, y:0}
    element.onmousedown = function(e) { 
        element.offset.x = e.layerX;
        element.offset.y = e.layerY;
        element.mouseDown = 1;
    }
    element.onmouseup = function() {
        element.mouseDown = 0;
    }
    element.onmousemove = function(e){
        if(element.mouseDown==1){
            element.style.left = (e.clientX-element.offset.x)+"px";
            element.style.top = (e.clientY-element.offset.y)+"px";
            if(liveshare){
                vscode.postMessage({
                    command: "Drag",
                    id: element.id,
                    pos: {x: element.style.left, y: element.style.top}
                });
            }
        }   
    }
}

function onDrag(element, dragged, dragComplete){
    element.mouseDown = 0;
    element.offset = {x: 0, y:0}
    element.onmousedown = function(e) { 
        element.offset.x = e.layerX;
        element.offset.y = e.layerY;
        element.mouseDown = 1;
        //if(dragStart!=undefined)dragStart({x: e.layerX, y: e.layerY});
    }
    element.onmouseup = function() {
        element.mouseDown = 0;
        dragComplete();
    }
    element.onmousemove = function(e){
        if(element.mouseDown==1){
            let pos = {x: (e.layerX), y: (e.layerY)};
            dragged(pos);
        }   
    }
}