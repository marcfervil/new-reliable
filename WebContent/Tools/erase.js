//eraser tool for erasing.

class Eraser extends Tool{

    constructor(){
        super("Eraser", "images/eraser.svg");
    }

    getImage(){
        return "erase2.svg";
    }

    canvasDragStart(pos){
        this.svgRect = new SVGPointer(this.reliable.canvas, pos)
    }

    canvasDrag(pos){
        this.erase();
        this.svgRect.updateLocation(getMousePos());
    }


    canvasDragEnd(){
    
        this.erase();
        this.svgRect.delete();
    }
    
    debugRect(x, y, w, h, color){
        let debug = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        debug.setAttribute("x", x);
        debug.setAttribute("y", y);
        debug.setAttribute("width", w);
        debug.setAttribute("height", h);
        debug.style.stroke = color;
        debug.style.fill = "transparent";
        this.reliable.canvas.appendChild(debug);
        return debug;
    }


    svgCollisions(){
        

        let rect = this.svgRect.svg.getBoundingClientRectOld();
        let svgRect = this.reliable.canvas.createSVGRect();

        svgRect.x = (rect.x);
        svgRect.y = (rect.y);
        svgRect.width = 30 ;
        svgRect.height = 30 ;   


//        this.debugRect(svgRect.x, svgRect.y, svgRect.width, svgRect.height, "purple");
        
        let hits = this.reliable.canvas.getIntersectionList(svgRect, null);
        console.log(hits.length);
        if(hits.length>0) console.log("erasing")
        let realHits = [];
        for(let hit of hits)if(hit.parentNode.id != this.svgRect.id && hit.parentNode.id != "canvas")realHits.push(hit.reliableSvg);
        return realHits;
    }

   

    insideCursor(x, y){
        let x1 = parseInt(this.svgRect.pos.x);
        let y1 = parseInt(this.svgRect.pos.y);
        let x2 = parseInt(x1)+parseInt(this.svgRect.size);
        let y2 = parseInt(y1)+parseInt(this.svgRect.size);
        //console.log(x1+" "+y1+" "+x2+" "+y2+" "+x+" "+y)
        x = parseInt(x)
        y = parseInt(y);
        return (x > x1 && x < x2) && (y > y1 && y < y2)
    }

    eraserConnection(x, y){
        console.log(x+" first "+ y)
        x = x - this.svgRect.pos.x
        y = y - this.svgRect.pos.y
        let theta = Math.atan2(y/x)
        let r = parseInt(this.svgRect.size)
        x = r* Math.cos(theta) + this.svgRect.pos.x
        y = r* Math.sin(theta) + this.svgRect.pos.y
        console.log("r: "+r+" theta: "+theta+" rectx: "+this.svgRect.pos.x+" recty: "+this.svgRect.pos.y+" x: "+ x+ " y: "+ y)
        return new Vector2(x,y);

    }

    eraserConnection(x, y){
        //console.log(x+" first "+ y)
        let r = parseInt(this.svgRect.size)/2 + 5
        let rectCenterX = this.svgRect.pos.x + parseInt(this.svgRect.size)/2;
        let rectCenterY = this.svgRect.pos.y + parseInt(this.svgRect.size)/2;
        x = x - rectCenterX
        y = y - rectCenterY
        //console.log(x+" secon "+ y)
        let theta = Math.atan2(y,x)
        x = rectCenterX + (r* Math.cos(theta))
        y = rectCenterY + (r* Math.sin(theta)) 
        //console.log("r: "+r+" theta: "+theta+" rectx: "+rectCenterX+" recty: "+rectCenterY+" x: "+ x+ " y: "+ y)
        return new Vector2(x,y);

    }

    isCollidingLineSegment(path){

        console.log(path);

        path[1] = path[1].slice(0,path[1].length-1); //removes the 1 c
        let erased = false;
        let removeIndex = [];
        for(let i = 0; i<path.length; i+=2){
            let j = i+1;

            let x = path[i];
            let y = path[j];
            if(this.insideCursor(x,y)){
                removeIndex.push(i)
                erased = true;
            }
        }
        let minIndex = Math.min(...removeIndex)
        let maxIndex = Math.max(...removeIndex)
        //path.splice(minIndex, (maxIndex-minIndex)+2);
        let temp = path.splice(minIndex, path.length)
        temp.splice(0,Math.min((maxIndex-minIndex)+2, temp.length));
        let paths = []
        /*
<<<<<<< HEAD

        if(erased){
            if(path.length>1){
            let newPoint = this.eraserConnection(path[path.length-2],path[path.length-1]);
            path.push(newPoint.x);
            path.push(newPoint.y);
            paths.push(path)
            }
            
            if(temp.length>1){
                let newPoint = this.eraserConnection(temp[0],temp[1]);
                temp.unshift(newPoint.y);
                temp.unshift(newPoint.x);
                paths.push(temp)
            }
        }else{
            paths.push(path)
=======
*/
        if(path.length>1){
        let newPoint = this.eraserConnection(path[path.length-2],path[path.length-1]);
        path.push(newPoint.x);
        path.push(newPoint.y);
        paths.push(path)
        }
        
        if(temp.length>1){
            let newPoint = this.eraserConnection(temp[0],temp[1]);
            temp.unshift(newPoint.y);
            temp.unshift(newPoint.x);
            paths.push(temp)
//>>>>>>> b8a5b9855f9afc87601b947854dd6695447630d3
        }
        return paths
    }
    
    lineSegmentColisions(svgs){
        let eraseables = []
        for(let svg of svgs){
            let edited = svg.pathData.split(" ")
            //let edited = svg.path;

            let paths = this.isCollidingLineSegment(edited.splice(1,edited.length)); //gets rid of the M
            let firstPass = true;
            for(let temp of paths){
                //temp.length-2 has to be divisable by 6
                if(!(temp.length<8)){
                    while((temp.length-2)%6 !=0){
                        temp.push(temp[temp.length-2])
                        temp.push(temp[temp.length-2])
                    }
                    temp[1] = temp[1]+"C"
                    temp = "M "+temp.join(" ")
                    eraseables.push(temp)
                    if(firstPass){
                        Action.commit(this.reliable,{
                            action: "Replace",
                            SVGID: svg.id,
                            newPath: temp
                        })
                        svg.replacePath(temp);
                        firstPass = false;
                    }
                    else{
                        let tempPos = new Vector2(0,0);
                        Action.commit(this.reliable, {
                            action: "Draw",
                            id: Reliable.makeId(10) ,
                            path: temp,
                            color: "#AAB2C0",
                            pos: tempPos.toJSON()
                        })
                    }
                }else{
                    if(firstPass){
                        //svg.replacePath(temp)
                        Action.commit(this.reliable,{
                            action: "DeleteSVGPath",
                            id: svg.id
                        })
                    }
                }
                firstPass = false;
            }
        }
        return eraseables;
    }

    erase(){
        this.lineSegmentColisions(this.svgCollisions());
    }
}

class Replace extends Action{

    constructor(data){
        super(data)
    }

    execute(reliable){
        super.execute(reliable)
        let tempSvg = SVG.getFromId(this.data.SVGID)
        this.undoData = {
            id: this.data.SVGID,
            path: tempSvg.pathData
        }
        tempSvg.replacePath(this.data.newPath);   
    }

    undo(){
        let tempSVG = SVG.getFromId(this.undoData.id)
        tempSVG.replacePath(this.undoData.path)
    }
}

class DeleteSVGPath extends Action{
    constructor(data){
        super(data)
    }

    execute(reliable){
        super.execute(reliable)
        let tempSvg = SVG.getFromId(this.data.id)
        this.restoreSVGPath = {
            id: tempSvg.id,
            path: tempSvg.pathData,
            color: tempSvg.color

        }
        let index = this.reliable.svgs.indexOf(tempSvg)
        if (index > -1) {
            this.reliable.svgs.splice(index, 1);
        }
        tempSvg.delete();
    }

    undo(){
        this.svgPath = new SVGPath(reliable.canvas, new Vector2(),this.restoreSVGPath.id);
        this.svgPath.replacePath(this.restoreSVGPath.path);
        this.svgPath.svg.style.stroke = this.restoreSVGPath.color;
        reliable.svgs.push(this.svgPath);
    }

}