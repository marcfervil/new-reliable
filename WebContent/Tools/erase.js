//eraser tool for erasing.
//^^^^ a very important comment



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
            if(hit.parentNode.id != this.svgRect.id && hit.parentNode.id != "canvas"){
                lineHits.push(hit.reliableSvg);
            }
        }
    
        return lineHits;
    }

    
    //returns up to (2) new paths that are the result of eraseing [non refundable]
    splitLine(svg){
        let bezierHelper = new BezierPointHelper()//this.reliable.canvas, this.svgRect, svg.path);
        bezierHelper.getCurvePoints(svg.path);
    }
    
    //takes array of pathData and draws it
    createNewPaths(newPaths){
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
        }
    }


    erase(){
        let collidedSVG = this.svgCollisions();

        for(let svg of collidedSVG){
            this.splitLine(svg);
        }
    }

}




class BezierPointHelper{

   

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
        return (x > x1 && x < x2) && (y > y1 && y < y2);
    }

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
    

    getCurvePoints(path){
        let densitiy = 10;

        for(let i = 1; i <path.length; i++){
            let point = path[i].points

            let lastPoint = path[i-1].last();
            console.log("lastPoint ",lastPoint, " handle1 ", point.handle1, " handle2 ", point.handle2, " end ", point.end)
            for(let j = 0; j<densitiy;j++){
                let time = (j / (densitiy - 1));

                let p = new Vector2(0,0);
                p.x = this.BezierCubic(lastPoint.x, point.handle1.x, point.handle2.x, point.end.x, time);
                p.y = this.BezierCubic(lastPoint.y, point.handle1.y, point.handle2.y, point.end.y, time);
                debugRect(p.x, p.y, 10, 10, "purple");

            

            }
            debugRect2(point.handle1, 10,10, "green")
            debugRect2(point.handle2, 10,10, "green")
            debugRect2(point.end, 10,10, "red")
         
            
        }

/*
       for (let i = 0; i < c_numPoints; ++i))
        {
            let t = (i) / (float(c_numPoints - 1));
       

            let p = new Vector2(0,0);
            p.x = this.BezierCubic(controlPoints[dex].x, controlPoints[dex+1].x, controlPoints[dex+2].x, controlPoints[dex+3].x, time);
            p.y = this.BezierCubic(controlPoints[dex].y, controlPoints[dex+1].y, controlPoints[dex+2].y, controlPoints[dex+3].y, time);

            //p.x = BezierCubic(point., t);
            p.y = BezierCubic(controlPoints[0].y, controlPoints[1].y, controlPoints[2].y, controlPoints[3].y, controlPoints[4].y, controlPoints[5].y, controlPoints[6].y, t);
            console.log("point at time %0.2f = (%0.2f, %0.2f)n", t, p.x, p.y);
        }*/

        
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