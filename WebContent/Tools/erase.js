//eraser tool for erasing.
//^^^^ a very important comment





class Eraser extends Tool{

    constructor(){
        super("Eraser", "images/eraser.svg");
        this.size = 100;
        this.sizeOffset = new Vector2(this.size/2, this.size/2);
        
    }

    getRect(){
        //this.svgRect.pos.x;
        return {"x":this.svgRect.pos.x+this.size/2, "y":this.svgRect.pos.y+this.size/2, "width":this.size, "height":this.size};
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

        
        let svgPoint = canvas.createSVGPoint();
        svgPoint.x = point.x
        svgPoint.y = point.y
        return this.svgRect.svg.isPointInFill(svgPoint)

        
    }

    //returns the point the eraser made contact
    getEraserConnectionOLD(vec){
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

    getEraserConnection(line1, line2){
        let rect = this.getRect();
        //adjust for eraser
        rect.x = rect.x-this.size/2
        rect.y = rect.y-this.size/2
        return this.findRectIntersection(rect, line1, line2)
    }
    

    /*
    insertMoveCurve(curvePoints, location){
        let newEndVect = this.getEraserConnection(curvePoints[location-1].position())
        let newStartVect = this.getEraserConnection(curvePoints[location].position())

        let newEndPos = new CurveCommand(newEndVect, newEndVect, newEndVect)
        let newStartPos = new MoveCommand(newStartVect)
        //curvePoints.splice(location, 0, newStartPos)

        //debugRect2(newStartPos.last(),10,10, "black", "black")
        //debugRect2(newEndVect,10,10, "blue", "blue")
    }
    */

    getFirstCurveToIndex(curvePoints){
        let index = 0;
        for(let point of curvePoints){
            if(point instanceof CurveCommand){
                return index;
            }
            index++
        }
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

    //checks to see if c is on the line defined by a and b
    isBetweenPoints(a, b, c){
        let crossproduct = (c.y - a.y) * (b.x - a.x) - (c.x - a.x) * (b.y - a.y)

        //compare versus epsilon for floating point values, or != 0 if using integers
        if(Math.abs(crossproduct) > 0) return false
        
    
        let dotproduct = (c.x - a.x) * (b.x - a.x) + (c.y - a.y)*(b.y - a.y)
        if (dotproduct < 0) return false
    
        let squaredlengthba = (b.x - a.x)*(b.x - a.x) + (b.y - a.y)*(b.y - a.y)
        if (dotproduct > squaredlengthba) return false
    
        return true
    }
    //https://www.geeksforgeeks.org/program-for-point-of-intersection-of-two-lines/
    find_intersection(A, B, C, D){
       
        let a1 = B.y - A.y
        //a1*=-1
        let b1 = A.x - B.x;
        let c1 = a1*(A.x) + b1*(A.y);

        // Line CD represented as a2x + b2y = c2
        let a2 = D.y - C.y;
        //a2*=-1
        let b2 = C.x - D.x;
        let c2 = a2*(C.x)+ b2*(C.y);
        
        let determinant = a1*b2 - a2*b1;
        
        if (determinant == 0)
        {
            // The lines are parallel. This is simplified
            // by returning a pair of FLT_MAX
            return null//new Point(Double.MAX_VALUE, Double.MAX_VALUE);
        }
        else
        {
            let x = (b2*c1 - b1*c2)/determinant;
            let y = (a1*c2 - a2*c1)/determinant;
            let point = new Vector2(x,y);
            if(this.isBetweenPoints(C,D, point)) return point;

            return null
        }
    }


    oldfind_intersection( p0, p1, p2, p3 ) {
        p1 = -1*p1
        p3 = -1*p3

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
    
        let t_numer = s32_x * s02_y - s32_y * s02_x
    
        if ((t_numer < 0) == denom_is_positive ) return null;
    
        if (((s_numer > denom) == denom_is_positive) || ((t_numer > denom) == denom_is_positive))  return null; // no collision

        let t = t_numer / denom
    
        let intersection_point = new Vector2( p0.x + (t * s10_x), p0.x + (t * s10_y) );
    
        return intersection_point
    }
    /**
     * returns the point that intersects with the line and rect.
     * 
     * @param {rect} rect
     * @param {Vector2} point1 
     * @param {Vector2} point2 
     */
    findRectIntersection(rect, point1, point2){
        let xrect = rect.x//-50;
        let yrect = rect.y//-50;
        let xValues = [xrect, xrect+rect.width];
        let yValues = [yrect, yrect+rect.height]
        let corners = [] //0 is upper left, 1 is upper right, 2 is lower left, 3 is lower right
        for(let x of xValues){
            for(let y of yValues){
                corners.push(new Vector2(x, y))
                //debugRect2(new Vector2(x, y), 10,10, "black","black")
            }
        }

        let intersectPoints = []
        //don't match 0 and 3 or 1 and 2
        intersectPoints.push(this.find_intersection(corners[0], corners[1], point1, point2))
        intersectPoints.push(this.find_intersection(corners[0], corners[2], point1, point2))
        intersectPoints.push(this.find_intersection(corners[1], corners[3], point1, point2))
        intersectPoints.push(this.find_intersection(corners[2], corners[3], point1, point2))
        let retpoint = null
        for(let point of intersectPoints){
            if(point !=null){
                retpoint = point
                //return point
            }
        }

        return retpoint
        
        /*
        let topLineP1 = new Vector2(rect.pos.x, rect.pos.y);
        let topLineP2 = topLineP1+ new Vector2(rect.width, 0);

        let bottomLineP1 = topLineP1+new Vector2(0, rect.height)
        let bottomLineP2 = bottomLineP1+new Vector2(rect.width, 0)
        */

    }

    //returns the first anchor left to the point
    findLeftCurve(curvePoint, index){
        for(var i = index; curvePoint[i] instanceof TemporaryCurveCommand; i--){}
        return curvePoint[i];
    }
    //returns the first anchor right to the point
    findRightCurve(curvePoint, index){
        for(var i = index; curvePoint[i] instanceof TemporaryCurveCommand; i++){}
        return curvePoint[i];       
    }
    //returns a point a T% down the straight line between A and B
    findTPointStraightLine(A,B,T){
        //console.log("A ",A, " B ", B," T ",T)
        let x = A.x+T*(B.x-A.x)
        let y = A.y+T*(B.y-A.y)

        return new Vector2(x, y);
    }

    //takes a svg path and a point that is on the lin
    splitBezier(curvePoints, T){

        //let left = this.findLeftCurve(curvePoints,index)
        //let right = this.findRightCurve(curvePoints, index)

        //time or the percentage down the line the point is on the bezier curve (assuming curvepoints[index] will return a temppoint)
        //let tPoint = curvePoints[index]
        
        //console.log("index ", index," curvepoint ", curvePoints)
        //let T = tPoint.Tvalue
        if(T==undefined){
            T = 0
        }

        //A and D are endpoints. B and C are handles
        let A = curvePoints[0]
        let B = curvePoints[1]
        let C = curvePoints[2]
        let D = curvePoints[3]
        /*
        let A = left.position()
        let B = right.points.handle1
        let C = right.points.handle2
        let D = right.position()
        */

        //algorithm
        let E = this.findTPointStraightLine(A, B, T)
        let F = this.findTPointStraightLine(B, C, T)
        let G = this.findTPointStraightLine(C, D, T)
        let H = this.findTPointStraightLine(E, F, T)
        let J = this.findTPointStraightLine(F, G, T)
        let K = this.findTPointStraightLine(H, J, T)

        //the new bezier curve is A,E,H,K and K,J,G,D.
        let leftCurveTo = new CurveCommand(E,H,K)
        let rightMoveTo = new MoveCommand(K)
        let rightCurveTo = new CurveCommand(J,G,D)
        if(E.isValid() && H.isValid() && K.isValid() && J.isValid() && G.isValid() && D.isValid()){
            //console.log(E,H,K,J,G,D)
            return [leftCurveTo,rightMoveTo, rightCurveTo]
        }
        return null


        
    }

    //returns lines that makes up eraser (probably a better way to write this but should be good enough)
    getEraserLines(){
        let lt = this.svgRect.pos
        let lb = new Vector2(this.svgRect.pos.x, this.svgRect.pos.y+this.svgRect.size)
        let rt = new Vector2(this.svgRect.pos.x+this.svgRect.size, this.svgRect.pos.y)
        let rb = new Vector2(this.svgRect.pos.x+this.svgRect.size, this.svgRect.pos.y+this.svgRect.size)

        let left = [lt, lb]
        let right = [rt, rb]
        let top = [lt,rt]
        let bottom = [lb,rb]

        let lines = [left,right,top,bottom]
        return lines
    }

    removeOverlapLines(lines){
        let newLines = []
        for(let line of lines){
            let inside = true;
            for(let point of line){

                //debugRect2(point.position(),10,10,"red","red")
                if(!this.insideCursor(point.position())){
                    inside = false
                    break;
                }
            }
            if(!inside) newLines.push(line)

        }
        return newLines
    }

    splitLine(curvePoints){
        let newLines = []


        let lines = this.getEraserLines()

        for(let line of lines) {
            for (let i = 1; i < curvePoints.length; i++) {
                if(curvePoints[i] instanceof MoveCommand) continue


                let bezierCurve = []
                bezierCurve.push(curvePoints[i - 1].position())
                bezierCurve.push(curvePoints[i].points.handle1)
                bezierCurve.push(curvePoints[i].points.handle2)
                bezierCurve.push(curvePoints[i].position())


                let intersection = computeIntersections(bezierCurve, line)
                if (intersection != null) {
                    let newCurves = this.splitBezier(bezierCurve, intersection)
                    if(newCurves!=null){
                        curvePoints[i] = newCurves[0]
                        curvePoints.splice(i+1,0,newCurves[2])
                        curvePoints.splice(i+1,0,newCurves[1])
                        i+=2
                    }
                    //console.log("intersection")
                } else {
                    //console.log("no intersection")
                }

            }
        }

        for(let i =1; i<curvePoints.length;i++){

            if(curvePoints[i] instanceof MoveCommand){
                newLines.push(curvePoints.splice(0,i))
                i=1
            }
        }
        newLines.push(curvePoints)

        newLines = this.removeOverlapLines(newLines)
        return newLines


    }

    
    //returns up to (2) new paths that are the result of eraseing [non refundable]
    createNewPaths(svg){
       
        let newPaths = this.splitLine(svg.path)


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
        let collidedSVG = this.svgCollisions();

        for(let svg of collidedSVG){
            this.createNewPaths(svg);
        }
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

//svg curve line compute intersection code ---------------------------------------------------

function bezierCoeffs(P0,P1,P2,P3)
{
	var Z = Array();
	Z[0] = -P0 + 3*P1 + -3*P2 + P3; 
    Z[1] = 3*P0 - 6*P1 + 3*P2;
    Z[2] = -3*P0 + 3*P1;
    Z[3] = P0;
	return Z;
}

/*computes intersection between a cubic spline and a line segment*/
function computeIntersections(bezierCurve, line)
{
   //console.log("Bezier curve ", bezierCurve)
    let px,py,lx,ly
    px = bezierCurve.map(pos => pos.x)
    py = bezierCurve.map(pos => pos.y)
    lx = line.map(pos => pos.x)
    ly = line.map(pos => pos.y)


    //console.log("px ", px, " py ",py," lx ", lx," ly ", ly)

    var X=Array();
    
    var A=ly[1]-ly[0];	    //A=y2-y1
	var B=lx[0]-lx[1];	    //B=x1-x2
	var C=lx[0]*(ly[0]-ly[1]) + 
          ly[0]*(lx[1]-lx[0]);	//C=x1*(y1-y2)+y1*(x2-x1)

	var bx = bezierCoeffs(px[0],px[1],px[2],px[3]);
	var by = bezierCoeffs(py[0],py[1],py[2],py[3]);
	
    var P = Array();
	P[0] = A*bx[0]+B*by[0];		/*t^3*/
	P[1] = A*bx[1]+B*by[1];		/*t^2*/
	P[2] = A*bx[2]+B*by[2];		/*t*/
	P[3] = A*bx[3]+B*by[3] + C;	/*1*/
	
	var r=cubicRoots(P);
	
    /*verify the roots are in bounds of the linear segment*/
    for (var i=0;i<3;i++)
    {
        t=r[i];
        
        X[0]=bx[0]*t*t*t+bx[1]*t*t+bx[2]*t+bx[3];
        X[1]=by[0]*t*t*t+by[1]*t*t+by[2]*t+by[3];            
            
        /*above is intersection point assuming infinitely long line segment,
          make sure we are also in bounds of the line*/
        var s;
        if ((lx[1]-lx[0])!=0)           /*if not vertical line*/
            s=(X[0]-lx[0])/(lx[1]-lx[0]);
        else
            s=(X[1]-ly[0])/(ly[1]-ly[0]);
        
        /*in bounds?*/    
        if (t<0 || t>1.0 || s<0 || s>1.0)
        {
            X[0]=-100;  /*move off screen*/
            X[1]=-100;
        }else{
            //console.log(t)
            return t;
            //return new Vector2(X[0], X[1])
            //return {"x": X[0], "y": X[1]}
            //return X;
        }
        
        /*move intersection point*/
        //console.log("point " ,X[0], "Point 2", X[1])
        //I[i].setAttributeNS(null,"cx",X[0]);
        //I[i].setAttributeNS(null,"cy",X[1]);
    }
    return null;
    
}
// sign of number
function sgn( x )
{
    if (x < 0.0) return -1;
    return 1;
}


/*based on http://mysite.verizon.net/res148h4j/javascript/script_exact_cubic.html#the%20source%20code*/
function cubicRoots(P)
{
	var a=P[0];
	var b=P[1];
	var c=P[2];
	var d=P[3];
	
	var A=b/a;
	var B=c/a;
	var C=d/a;

    var Q, R, D, S, T, Im;

    var Q = (3*B - Math.pow(A, 2))/9;
    var R = (9*A*B - 27*C - 2*Math.pow(A, 3))/54;
    var D = Math.pow(Q, 3) + Math.pow(R, 2);    // polynomial discriminant

    var t=Array();
	
    if (D >= 0)                                 // complex or duplicate roots
    {
        var S = sgn(R + Math.sqrt(D))*Math.pow(Math.abs(R + Math.sqrt(D)),(1/3));
        var T = sgn(R - Math.sqrt(D))*Math.pow(Math.abs(R - Math.sqrt(D)),(1/3));
        t[0] = -A/3 + (S + T);                    // real root
        t[1] = -A/3 - (S + T)/2;                  // real part of complex root
        t[2] = -A/3 - (S + T)/2;                  // real part of complex root
        Im = Math.abs(Math.sqrt(3)*(S - T)/2);    // complex part of root pair   
        
        /*discard complex roots*/
        if (Im!=0)
        {
            t[1]=-1;
            t[2]=-1;
        }
    
    }
    else                                          // distinct real roots
    {
        var th = Math.acos(R/Math.sqrt(-Math.pow(Q, 3)));
        
        t[0] = 2*Math.sqrt(-Q)*Math.cos(th/3) - A/3;
        t[1] = 2*Math.sqrt(-Q)*Math.cos((th + 2*Math.PI)/3) - A/3;
        t[2] = 2*Math.sqrt(-Q)*Math.cos((th + 4*Math.PI)/3) - A/3;
        Im = 0.0;
    }

    
    /*discard out of spec roots*/
	for (var i=0;i<3;i++) 
        if (t[i]<0 || t[i]>1.0) t[i]=-1;
                
	/*sort but place -1 at the end*/
    t=sortSpecial(t);

    //console.log(t[0]+" "+t[1]+" "+t[2]);
    return t;
}


function sortSpecial(a)
{
    var flip;
    var temp;
    
    do {
        flip=false;
        for (var i=0;i<a.length-1;i++)
        {
            if ((a[i+1]>=0 && a[i]>a[i+1]) ||
                (a[i]<0 && a[i+1]>=0))
            {
                flip=true;
                temp=a[i];
                a[i]=a[i+1];
                a[i+1]=temp;
                
            }
        }
    } while (flip);
	return a;
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

