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

            if(liveshare && isVsCode){
                vscode.postMessage({
                    command: "Drag",
                    id: element.id,
                    pos: {x: element.style.left, y: element.style.top}
                });
            }
            
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
        
        if(color)element.firstChild.style.stroke = "green";
        element.start = {x: e.offsetX, y:e.offsetY};
        element.offset = {x: e.layerX, y:e.layerY};
        //if(!element.offset){
          //  console.log("new set");
            
        //}
       // element.clickOffset = {x: e.layerX, y:e.layerY};

        element.mouseDown = 1;
 
        isDragging = true; 
        //element.style.zIndex = "1000";
        //bringToTop(element);

        document.addEventListener('mouseup', mouseUp);
        document.addEventListener('mousemove', mouseMove);
    
    }
    

/*
    element.onmousemove = function(e){
        if(element.mouseDown==1){
            let x = (e.clientX-element.offset.x);
            let y = (e.clientY-element.offset.y)
           
            element.setAttribute('transform',`translate(${x}, ${y})`);
           

            if(liveshare){
                vscode.postMessage({
                    command: "Drag",
                    id: element.id,
                    pos: {x: element.style.left, y: element.style.top}
                });
            }
        }   
    }*/
   

    

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

    
    document.addEventListener('mouseup', mouseUp);

    
}

class ImageSVG{
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

}

class SVG{

    constructor(parentId, pos){
        this.pos = pos;
        this.parentId = parentId;
        this.path = [pos];
        this.pathData = "M "+pos.toString();
        this.parent = $("#"+this.parentId)[0]; //Get svg element

        this.group = document.createElementNS("http://www.w3.org/2000/svg", 'g');

        //create SVG
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", 'path');

        //console.log(this.svg);
        this.svg.setAttribute("d", this.pathData); //Set path's data
        this.svg.style.stroke = "#AAB2C0"; //Set stroke colour
        this.svg.style.fill = "transparent";
        this.svg.style.strokeWidth = 3;
        this.svg.style.strokeLinejoin = "miter";
        this.svg.style.strokeLinecap = "butt";
        this.svg.style.strokeMiterlimit = 4;
        this.svg.style.strokeDasharray = "none";
        this.svg.style.strokeDashoffset= 0;
        this.parent.appendChild(this.group);

        this.group.appendChild(this.svg);
        makeDraggable(this.group, false, true);
    }

    addPoint(pos){
        this.path.push(pos);
        this.updateSvg(pos.toString())

    }

    delete(){
        $(this.svg).remove();
    }



    //funny
    /*
    smoothify(){
        let tempPath = this.path.slice();
        let svgData = "";
        while(tempPath.length >= 3) { 
            let curve = tempPath.splice(0, 3);
            svgData += `${curve[0]}, ${curve[1]}, ${curve[2]}`;
        }
        svgData = "M "+this.path[2].toString() + "C "+ svgData;
        this.replaceSvg(svgData);
        
    }*/
//https://yqnn.github.io/svg-path-editor/

    smoothify(){

        try{
            let tempPath = this.path.slice();
            let svgData = "";
            let start = tempPath.splice(0, 1);
            let lastPos = undefined;
    
            let skip = 0;
            let total = 0;
            while(tempPath.length >= 3) { 
                total+=1;
                let curve = tempPath.splice(0, 3);
                //if(lastPos!=undefined)console.log( curve[2].distance(lastPos));
                //20;
                if(lastPos!=undefined && curve[2].distance(lastPos) < 50){
                    skip +=1;
                    //lastPos = curve[2];
                // continue;
                }
                lastPos = curve[2];
                svgData += ` ${curve[0]} ${curve[1]} ${curve[2]}`;

            }

            svgData = "M "+start.toString() + "C"+ svgData;

            let ogPath = this.replaceSvg(svgData);
        
        }catch(e){
            console.log("error making SVG?");
        }
            /*
            let uncompressedSVG = new SVG(this.parentId, this.pos);

            uncompressedSVG.replaceSvg(ogPath);
            uncompressedSVG.svg.setAttribute('transform','translate(400,0)');*/
        
    }

    replaceSvg(updateSvg){
        let ogPath = this.pathData;
        this.pathData = updateSvg;
        this.svg.setAttribute("d", updateSvg);
        return ogPath;
    }

    updateSvg(svgData){
        //console.log(svgData);
        this.pathData += "L"+svgData;
        this.svg.setAttribute("d", this.pathData);
    }
    
    

}