//eraser tool for erasing.
//^^^^ a very important comment






class Eraser extends Tool{

    constructor(){
        super("Eraser", "images/eraser.svg");
        this.size = 100;
        this.sizeOffset = new Vector2(this.size/2, this.size/2);
        
    }

    activated(){
        console.log("OOOH WEE HE TRYNA ERASE")
    }

    getImage(){
        return "erase2.svg";
    }

    canvasDragStart(pos){
        this.svgRect = new SVGPointer(this.reliable.canvas, this.size, pos.subtract(this.sizeOffset))
        this.erase();
    }

    canvasDrag(pos){ 

        this.svgRect.updateLocation(new Vector2(pos.x, pos.y).subtract(this.sizeOffset));
        this.erase();
    }

    canvasDragEnd(){
        this.svgRect.delete();
    }

    //returns a list of svgs colliding with the eraser.
    svgCollisions(){
        let rect = this.svgRect.svg.getBoundingClientRectOld();
        let svgRect = this.reliable.canvas.createSVGRect();

        svgRect.x = rect.x;
        svgRect.y = rect.y;
        svgRect.width = this.size;
        svgRect.height = this.size;

        let hits = this.reliable.canvas.getIntersectionList(svgRect, null);
        let lineHits = [];
        
        for(let hit of hits){
            //filters out the eraser and canvas
            if(hit.parentNode.id != this.svgRect.id && hit.parentNode.id != "canvas" && hit.reliableSvg instanceof SVGPath ){
                lineHits.push(hit.reliableSvg);
            }
        }
    
        return lineHits;
    }
    insideCursor(point){
        let x = point.x
        let y = point.y
        let x1 = this.svgRect.pos.x;
        let y1 = this.svgRect.pos.y;
        let x2 = x1 + this.svgRect.size;
        let y2 = y1 + this.svgRect.size;
     
        return (x > x1 && x < x2) && (y > y1 && y < y2);
    }

    //returns the point the eraser made contact
    getEraserConnection(vec){
        let x = vec.x
        let y = vec.y

        let r = this.svgRect.size/2
        let rectCenterX = this.svgRect.pos.x + r;
        let rectCenterY = this.svgRect.pos.y + r;
        x = x - rectCenterX
        y = y - rectCenterY
        let theta = Math.atan2(y, x)
        x = rectCenterX + (r * Math.cos(theta))
        y = rectCenterY + (r * Math.sin(theta)) 
        //console.log("r: "+r+" theta: "+theta+" rectx: "+rectCenterX+" recty: "+rectCenterY+" x: "+ x+ " y: "+ y)
        return new Vector2(x, y);

    }
    

    insertMoveCurve(curvePoints, location){
        let newEndVect = this.getEraserConnection(curvePoints[location-1].position())
        let newStartVect = this.getEraserConnection(curvePoints[location].position())

        let newEndPos = new CurveCommand(newEndVect, newEndVect, newEndVect)
        let newStartPos = new MoveCommand(newStartVect)
        //curvePoints.splice(location, 0, newStartPos)

        //debugRect2(newStartPos.last(),10,10, "black", "black")
        //debugRect2(newEndVect,10,10, "blue", "blue")


        
    }


    getFirstCurveTo(curvePoints){
        return this.getFirstElement(curvePoints, CurveCommand);
    }

    getFirstElement(curvePoints, svgElementClass){
        for(let point of curvePoints){
            if(point instanceof svgElementClass){
                return point;
            }
        }
    }

    getFirstTwoTempPoints(curvePoints){
        let count = 0;
        let tempPoints = []

        for(let i = 0; i < curvePoints.length && count<2; i++){
            if(curvePoints[i] instanceof TemporaryCurveCommand){
                tempPoints.push(curvePoints[i])
                count++;
            }
        }

        if(count ==0) {
            //debugRect2(curvePoints.last().position(),10,10, "black", "black")
            return [curvePoints.last().position(), curvePoints.last().position()]
        }
        if(count==1){
            //debugRect2(tempPoints[0].position(),10,10, "purple", "purple")
            return [tempPoints[0].position(), tempPoints[0].position()]
        }
        if(count==2){
            //debugRect2(tempPoints[0].position(),10,10, "red", "red")
            //debugRect2(tempPoints[1].position(),10,10, "green", "green")
            return [tempPoints[0].position(), tempPoints[1].position()]
        }
    }

    find_intersection( p0, p1, p2, p3 ) {

        let s10_x = p1.x - p0.x
        let s10_y = p1.y - p0.y
        let s32_x = p3.x - p2.x
        let s32_y = p3.y - p2.y
    
        let denom = s10_x * s32_y - s32_x * s10_y
        
        if (denom == 0) return null; // collinear
        
        let denom_is_positive = denom > 0
    
        let s02_x = p0.x - p2.x;
        let s02_y = p0.y - p2.y;
    
        let s_numer = s10_x * s02_y - s10_y * s02_x
     
        if ((s_numer < 0) == denom_is_positive ) return null;
        console.log("not null1");
    
        let t_numer = s32_x * s02_y - s32_y * s02_x
    
        if ((t_numer < 0) == denom_is_positive ) return null;
    
        if (((s_numer > denom) == denom_is_positive) || ((t_numer > denom) == denom_is_positive))  return null; // no collision

        let t = t_numer / denom
    
        let intersection_point = new Vector2( p0.x + (t * s10_x), p0.x + (t * s10_y) );
    
        return intersection_point
    }

    splitLine(curvePoints){
        let newLines = []
        //goes through entire list of points on the line
        let intersectedWithLine = false
        for(let i = 0 ; i < curvePoints.length; i++){
            let startIndex = i;
            let endIndex = 0;
            intersectedWithLine = false
            //get start and end index of adjacent line segment points that the eraser is overlapping with
            while(startIndex+endIndex<curvePoints.length && this.insideCursor(curvePoints[startIndex+endIndex].position())){
                endIndex++;
                intersectedWithLine = true
            }

            //checks if eraser overlap is found then start splitting into two lines
            if(intersectedWithLine){
                
                //splits curvePoints into first half and second half
                let firstHalf = curvePoints.splice(0,startIndex)
                let secondHalf = curvePoints.splice(endIndex, curvePoints.length)

                if(startIndex !=0){
                    let newEndVect = this.getEraserConnection(firstHalf.last().position())
                    let newEndPos = new CurveCommand(newEndVect, newEndVect, newEndVect)
                    firstHalf.push(newEndPos)
                    //removes temporary curve points and pushes it to the list of split lines that we return
                   
                }
                if(secondHalf.length > 0){
                   
                    let newStartVect = this.getEraserConnection(secondHalf[0].position())
                    let newStartPos = new MoveCommand(newStartVect);

                    
                    let firstCurve = this.getFirstCurveTo(secondHalf)
                    let firstTempPoint = this.getFirstElement(secondHalf, TemporaryCurveCommand)
                    
                    secondHalf.unshift(new MoveCommand(firstTempPoint.position()))

                    firstCurve.points.handle1 = firstCurve.position();
                    firstCurve.points.handle2 = firstCurve.position();
                   
                }

                newLines.push(firstHalf.filter(command => !(command instanceof TemporaryCurveCommand)))
                newLines.push(secondHalf)

                //console.log("endIndex", endIndex, curvePoints.length, curvePoints)
                break;

            }
        }
       
        if(!intersectedWithLine) return [curvePoints.filter(command => !(command instanceof TemporaryCurveCommand))]
        newLines[newLines.length - 1] = newLines[newLines.length - 1].filter(command => !(command instanceof TemporaryCurveCommand));
        return newLines;
    }

    
    //returns up to (2) new paths that are the result of eraseing [non refundable]
    createNewPaths(svg){
        let bezierHelper = new BezierPointHelper()//this.reliable.canvas, this.svgRect, svg.path);
      //  if(!hasDrawn){
            this.curvePoints = bezierHelper.getCurvePoints(svg.path);
     //   }
        //console.log("split line")
        let newPaths = this.splitLine(this.curvePoints)

        svg.delete()
        for(let path of newPaths){
           
            let tempPath = SVGPath.stringifyPath(path)
            //console.log(tempPath);
            Action.commit(this.reliable, {
                action: "Draw",
                id: Reliable.makeId(10) ,
                path: tempPath,
                color: "#AAB2C0",
                pos: tempPath,
            }, false)
        }
    }

    erase(){
        let line1 = new Vector2(0,0);
        let line2 = new Vector2(1,1);
        
        let line3 = new Vector2(0,1);
        let line4 = new Vector2(1,0);


        let intersect = this.find_intersection(line1, line2, line3, line4);
        console.log(intersect);
        /*
        let collidedSVG = this.svgCollisions();

        for(let svg of collidedSVG){
            this.createNewPaths(svg);
        }
        */
    }

}


class BezierPointHelper{
 
    getCurvePoints(path){
       
        let densitiy = 15;
        let curvePoints = []
        curvePoints.push(path[0]);
        for(let i = 1; i <path.length; i++){
            let point = path[i].points

            let lastPoint = path[i-1].position();

            for(let j = 0; j<densitiy;j++){
                let time = (j / (densitiy - 1));

                let curvePoint = new Vector2(0,0);
                curvePoint.x = this.BezierCubic(lastPoint.x, point.handle1.x, point.handle2.x, point.end.x, time);
                curvePoint.y = this.BezierCubic(lastPoint.y, point.handle1.y, point.handle2.y, point.end.y, time);
            
                let curvePointCommand = new TemporaryCurveCommand(curvePoint);

         
                curvePoints.push(curvePointCommand)

            }
            curvePoints.push(path[i]);

        }
        return curvePoints

    }

    mix(a, b, t)
    {
        // degree 1
        return a * (1 - t) + b*t;
    }

    BezierQuadratic(A, B, C, t)
    {
        // degree 2
        let AB = this.mix(A, B, t);
        let BC = this.mix(B, C, t);
        return this.mix(AB, BC, t);
    }

    BezierCubic(A, B, C, D, t)
    {
        // degree 3
        let ABC = this.BezierQuadratic(A, B, C, t);
        let BCD = this.BezierQuadratic(B, C, D, t);
        return this.mix(ABC, BCD, t);
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