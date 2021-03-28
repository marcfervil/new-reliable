//eraser tool for erasing.
//^^^^ a very important comment




hasDrawn = false;
class Eraser extends Tool{

    constructor(){
        super("Eraser", "images/eraser.svg");
        this.size = 40
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

    //[ 1 2 3 4 5 6]

    //returns the point the eraser made contact
    getEraserConnection(vec){
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
        return new Vector2(x, y);

    }

    insertMoveCuve(curvePoints, location){

    }
    

    splitLine(curvePoints){
        for(let i = 0 ; i < curvePoints.length; i++){
            let endIndex = 0
            while(i+endIndex<curvePoints.length && this.insideCursor(curvePoints[i+endIndex].last()))endIndex++;
            if(endIndex > 0 ){
                //curvePoints.splice(startIndex, endIndex)
                
                let lst = curvePoints.slice(i, i+endIndex)
                for(let i of lst){
                    
                    if(i.rect !== undefined){
                        i.rect.remove();
                    }
                }

                //curvePoints = this.insertMoveCuve(curvePoints, i)

            }
        }
    }

    
    //returns up to (2) new paths that are the result of eraseing [non refundable]
    createNewPaths(svg){
        let bezierHelper = new BezierPointHelper()//this.reliable.canvas, this.svgRect, svg.path);
        if(!hasDrawn){
            this.curvePoints = bezierHelper.getCurvePoints(svg.path);
        }
        //console.log("split line")
        let newPaths = this.splitLine(this.curvePoints)

        /*
        for(let path of newPaths){
            svg.delete()
            let tempPath = SVGPath.makeSVGPath(path)
            
            Action.commit(this.reliable, {
                action: "Draw",
                id: Reliable.makeId(10) ,
                path: tempPath,
                color: "#AAB2C0",
                pos: path[0].toJSON(),
            }, false)
        }*/
    }


    erase(){
        let collidedSVG = this.svgCollisions();

        for(let svg of collidedSVG){
            this.createNewPaths(svg);
        }
    }

}




class BezierPointHelper{

 
    getCurvePoints(path){
        let densitiy = 10;
        let curvePoints = []
        let c = 0;
        for(let i = 1; i <path.length; i++){
            let point = path[i].points

            let lastPoint = path[i-1].last();
            curvePoints.push(path[i-1]);
            for(let j = 0; j<densitiy;j++){
                let time = (j / (densitiy - 1));

                let curvePoint = new Vector2(0,0);
                curvePoint.x = this.BezierCubic(lastPoint.x, point.handle1.x, point.handle2.x, point.end.x, time);
                curvePoint.y = this.BezierCubic(lastPoint.y, point.handle1.y, point.handle2.y, point.end.y, time);
                
                

               new SVGText(app.canvas, curvePoint, Reliable.makeId(10)+"Text", c+"");
                c++;

                let curvePointCommand = new TemporaryCurveCommand(curvePoint);

                if(!hasDrawn){
                
                    curvePointCommand.rect = debugRect(curvePoint.x, curvePoint.y, 10, 10, "purple");
                }
         
                curvePoints.push(curvePointCommand)

            }
            curvePoints.push(path[i]);
            if(!hasDrawn){
                debugRect2(point.handle1, 10,10, "green")
                debugRect2(point.handle2, 10,10, "green")
                debugRect2(point.end, 10,10, "red")
            }
        }
        hasDrawn = true;
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