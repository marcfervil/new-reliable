//eraser tool for erasing.



class Eraser extends Tool{


    constructor(){
        super("Eraser", "images/eraser.svg");
        this.first = true
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

    svgCollisions(){
        

        let rect = this.svgRect.svg.getBoundingClientRectOld();
        let svgRect = this.reliable.canvas.createSVGRect();

        svgRect.x = rect.x;
        svgRect.y = rect.y;
        svgRect.width = 30 ;
        svgRect.height = 30 ;   

        let hits = this.reliable.canvas.getIntersectionList(svgRect, null);
        let realHits = [];
        for(let hit of hits)if(hit.parentNode.id != this.svgRect.id && hit.parentNode.id != "canvas"){// && !hit.reliableSvg.isLocked()

            realHits.push(hit.reliableSvg);
        }
        return realHits;
    }

    splitLine(svg){
        let newPaths =  new bezierPointHelper(this.reliable.canvas, this.svgRect, svg.path)
        for(let i of newPaths){
            svg.delete()
            let tempPath = SVGPath.makeSVGPath(i)

            Action.commit(this.reliable, {
                action: "Draw",
                id: Reliable.makeId(10) ,
                path: tempPath,
                color: "#AAB2C0",
                pos: i[0].toJSON(),
            }, false)
        }
    }

    erase(){
        let collidedSVG = this.svgCollisions()
        for(let svg of collidedSVG){
            this.splitLine(svg)
            //break;
        }
    }
}

class bezierPointHelper{
    //linepoint is the fake poitns generated to fine the line
    //handle is the bezier cure hand
    //anchor is the point the handle is attached to
    //new is the new points at the cut
    constructor(canvas, rect, path){
        this.canvas = canvas
        this.path = path
        //this.fakePoints = [] //gets set next line
        this.svgRect = rect
        this.erased = false
        
        //this.bezierPoints = []
        let temp = this.fakePointGeneration()
        temp = this.isCollidingLineSegment(temp)
        if(this.erased == true){
            return this.removeFakes(temp)
        }else{
            return [];
        }

    }

    removeFakes(fakes){
        let ret = []
        for(let i of fakes){
            let retPath = []
            //retPath.push(i.shift().vpoint)
            for(let j of i){
            
                if(j.type == "anchor" || j.type =="new" || j.type=="handle"){
                    retPath.push(j.vpoint)
                    //debugRect(j.vpoint.x, j.vpoint.y, 5, 5, "green")
                }
            }
            if(retPath.length>=4){
                ret.push(retPath)
            }
        }

        return ret
    }

    isCollidingLineSegment(fpoints){
        let removeIndex = []
        //path[1] = path[1].slice(0,path[1].length-1); //removes the 1 c
        for(let i = 0; i<fpoints.length; i++){
            if(fpoints[i].type!="handle" && this.insideCursor(fpoints[i].vpoint)){
                removeIndex.push(i)
                this.erased = true;
            }
        }


        let minIndex = Math.min(...removeIndex)
        let maxIndex = Math.max(...removeIndex)
        let secondHalf = fpoints.splice(maxIndex, fpoints.length)
        fpoints.splice(minIndex, fpoints.length)
        let paths = []
        
        if(this.erased){
            console.log("erased")
            if(fpoints.length>4){
                let newPoint = this.eraserConnection(fpoints[fpoints.length-1].vpoint);
                
                do{//ensures the point is added at least once and then keeps going until a valid number exist
                    fpoints.push({vpoint: newPoint, type: "new"});
                    console.log("loop")
                    debugRect2(newPoint, 5,5, "blue") 
                    console.log(fpoints.length)
                }while((fpoints.length-1)%3!=0)
                paths.push(fpoints)
            }

            if(secondHalf.length>4){
                let newPoint = this.eraserConnection(secondHalf[0].vpoint);
                secondHalf.unshift({vpoint: newPoint, type: "new"});
                let counter = -1;
                let temp
                do{
                    counter++;
                    temp = secondHalf[counter]
                    
                }while(temp.type!="handle")
                secondHalf[counter].vpoint = newPoint
                secondHalf[1].vpoint = newPoint
                debugRect2(newPoint, 5,5, "green")
                paths.push(secondHalf)
            }
        }
        return paths
    }

    insideCursor(point){
        let x = point.x
        let y = point.y
        let x1 = parseInt(this.svgRect.pos.x);
        let y1 = parseInt(this.svgRect.pos.y);
        let x2 = parseInt(x1)+parseInt(this.svgRect.size);
        let y2 = parseInt(y1)+parseInt(this.svgRect.size);
        //console.log(x1+" "+y1+" "+x2+" "+y2+" "+x+" "+y)
        x = parseInt(x)
        y = parseInt(y);
        return (x > x1 && x < x2) && (y > y1 && y < y2)
    }

    //returns the point the eraser made contact
    
    eraserConnection(vec){
        let x = vec.x
        let y = vec.y
        let r = parseInt(this.svgRect.size)/2
        let rectCenterX = this.svgRect.pos.x + parseInt(this.svgRect.size)/2;
        let rectCenterY = this.svgRect.pos.y + parseInt(this.svgRect.size)/2;
        x = x - rectCenterX
        y = y - rectCenterY
        let theta = Math.atan2(y,x)
        x = rectCenterX + (r* Math.cos(theta))
        y = rectCenterY + (r* Math.sin(theta)) 
        //console.log("r: "+r+" theta: "+theta+" rectx: "+rectCenterX+" recty: "+rectCenterY+" x: "+ x+ " y: "+ y)
        return new Vector2(x,y);

    }
    

    fakePointGeneration(){
        let controlPoints = this.path
        let fpoints = []
        fpoints.push({vpoint: controlPoints[0], type: "anchor"})
        //debugRect2(controlPoints[0], 5,5, "red")

        for(let dex = 0; dex+1<controlPoints.length; dex+=3){            
            let c_numPoints = 20 //getting this number based on distance of point 0 and 3 would be a good idea
            for( let i = 0; i < c_numPoints; ++i){
                let time = (i / (c_numPoints - 1));
                let p = new Vector2(0,0);
                p.x = this.BezierCubic(controlPoints[dex].x, controlPoints[dex+1].x, controlPoints[dex+2].x, controlPoints[dex+3].x, time);
                p.y = this.BezierCubic(controlPoints[dex].y, controlPoints[dex+1].y, controlPoints[dex+2].y, controlPoints[dex+3].y, time);
                fpoints.push({vpoint: new Vector2(p.x, p.y), type: "linepoint"}) //false is fake
                //debugRect(p.x, p.y, 5, 5, "purple");
                //console.log("point at time "+time+" = ("+p.x+", "+p.y+")");
            }
            fpoints.push({vpoint: controlPoints[dex+1], type: "handle"})
            fpoints.push({vpoint: controlPoints[dex+2], type: "handle"})
            fpoints.push({vpoint: controlPoints[dex+3], type: "anchor"}) //if real is true it is a real point.
            //debugRect2(controlPoints[dex+3], 5,5, "red")
            //debugRect2(controlPoints[dex+1], 5,5, "yellow")
            //debugRect2(controlPoints[dex+2], 5,5, "yellow")
            
            //this.bezierPoints.push(controlPoints[dex+1])
            //this.bezierPoints.push(controlPoints[dex+1+1])
        }

        return fpoints
    }

    mix(a, b, t)
    {
        // degree 1
        return a * (1 - t) + b*t;
    }
    BezierQuadratic(A,B,C,t)
    {
        // degree 2
        let AB = this.mix(A, B, t);
        let BC = this.mix(B, C, t);
        return this.mix(AB, BC, t);
    }
    BezierCubic(A,B,C,D,t)
    {
        // degree 3
        let ABC = this.BezierQuadratic(A, B, C, t);
        let BCD = this.BezierQuadratic(B, C, D, t);
        return this.mix(ABC, BCD, t);
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
        tempSvg.makePath();
        tempSvg.replacePath(this.data.newPath);   
    }

    undo(){
        let tempSVG = SVG.getFromId(this.undoData.id)
        tempSVG.replacePath(this.undoData.path)
    }
}
