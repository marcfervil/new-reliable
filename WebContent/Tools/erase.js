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

        let hits = this.reliable.canvas.getIntersectionList(svgRect, null);
        let realHits = [];
        for(let hit of hits)if(hit.parentNode.id != this.svgRect.id && hit.parentNode.id != "canvas"){// && !hit.reliableSvg.isLocked()
            //hit.reliableSvg.lock();
            realHits.push(hit.reliableSvg);
        }
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



    
    
    //temporary helper function to use svg.path instead of svg.pathdata
    pathToDTranslator(Vpath){
        let ret = [];
        for(let point of Vpath ){
            ret.push(point.x+"");
            ret.push(point.y+"");

        }
        //console.log(ret)
        return ret;
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


    isCollidingLineSegment(controlPoints){
        const c_numPoints = 10;
        for( let i = 0; i < c_numPoints; ++i){
            let time = (i / (c_numPoints - 1));
            let p = new Vector2(0,0);
            p.x = this.BezierCubic(controlPoints[0].x, controlPoints[1].x, controlPoints[2].x, controlPoints[3].x, time);
            p.y = this.BezierCubic(controlPoints[0].y, controlPoints[1].y, controlPoints[2].y, controlPoints[3].y, time);
            this.debugRect(p.x, p.y, 10, 10, "purple");
            console.log("point at time "+time+" = ("+p.x+", "+p.y+")");
        }
    }

    lineSegmentColisions(svgs){
        /*
        for(let svg of svgs){
            let paths = this.isCollidingLineSegment(svg.path);
        }*/

        let tempSvg = new SVGPath(this.reliable.canvas,new Vector2(0,0));
        tempSvg.replacePath("M 3151.8 2858.6 C 3117.9 2864.8 3052.1 2919.0 3049.5 2940.5 3045.8 2975.9 3066.8 3018.7 3079.6 3025.0 3160.5 3073.7 3280.9 3192.3 3293.5 3233.6 3306.3 3286.3 3287.7 3373.6 3275.8 3391.3 3230.2 3449.7 3083.4 3509.8 3052.1 3493.5 2952.8 3434.0 2895.4 3342.3 2863.2 3170.9")
        console.log("refreshed")
        //console.log(tempSvg.path)
        this.isCollidingLineSegment(tempSvg.path)
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
        tempSvg.makePath();
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