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

function onDrag(element, dragged, dragStart, dragComplete){
    element.mouseDown = 0;
    element.offset = {x: 0, y:0}
    element.onmousedown = function(e) { 
        element.offset.x = e.layerX;
        element.offset.y = e.layerY;
        element.mouseDown = 1;
        if(dragStart!=undefined)dragStart({x: e.layerX, y: e.layerY});
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


class SVG{

    constructor(parentId, pos){
        this.pos = pos;
        this.parentId = parentId;
        this.path = [pos];
        this.pathData = "M "+pos.toString();
        this.parent = $("#"+this.parentId)[0]; //Get svg element

        //create SVG
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        console.log(this.svg);
        this.svg.setAttribute("d", this.pathData); //Set path's data
        this.svg.style.stroke = "#AAB2C0"; //Set stroke colour
        this.svg.style.fill = "transparent";
        this.svg.style.strokeWidth = 3;
        this.svg.style.strokeLinejoin = "miter";
        this.svg.style.strokeLinecap = "butt";
        this.svg.style.strokeMiterlimit = 4;
        this.svg.style.strokeDasharray = "none";
        this.svg.style.strokeDashoffset= 0;
        this.parent.appendChild(this.svg);
    }

    addPoint(pos){
        this.path.push(pos);
        this.updateSvg(pos.toString())

    }

    delete(){
        $(this.svg).remove();
    }


    /*
    smoothify(){
        let tempPath = this.path.slice();
        let svgData = "";
        while(tempPath.length >= 3) { 
            let curve = tempPath.splice(0, 3);
            svgData += `C ${curve[0]}, ${curve[1]}, ${curve[2]}`;
        }
        svgData = "M "+this.path[2].toString() + svgData;
        this.replaceSvg(svgData);
        
    }*/

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

        let tempPath = this.path.slice();
        let svgData = "";
        let start = tempPath.splice(0, 1);
        let lastPos = undefined;
        /*
        while(tempPath.length >= 3) { 
            let curve = tempPath.splice(0, 3);
            svgData += ` ${curve[0]} ${curve[1]} ${curve[2]}`;
       
        }*/
        let skip = 0;
        let total = 0;
        while(tempPath.length >= 3) { 
            total+=1;
            let curve = tempPath.splice(0, 3);
            if(lastPos!=undefined)console.log( curve[2].distance(lastPos));
            if(lastPos!=undefined && curve[2].distance(lastPos) < 20){
                skip +=1;
                //lastPos = curve[2];
                continue;
            }
            lastPos = curve[2];
            svgData += ` ${curve[0]} ${curve[1]} ${curve[2]}`;
           
        }

        svgData = "M "+start.toString() + "C"+ svgData;
        console.log("compressed "+((skip/total)*100)+"%");
        console.log(svgData);
        let ogPath = this.replaceSvg(svgData);
        
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