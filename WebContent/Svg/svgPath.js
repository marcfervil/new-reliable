bend = 10;

class SVGPath extends SVG{

    constructor(parent, pos, id, pathData){
        super("path", parent, pos, id)
        
        this.pathData = (pathData===undefined) ? "M "+pos.toString() : pathData;
        
        this.path = [pos];
        this.svg.setAttribute("d", this.pathData); 
        this.svg.style.stroke = "#AAB2C0"; 
        this.svg.style.fill = "transparent";
        this.svg.style.strokeWidth = 3;

        
        this.svg.style.strokeLinejoin = "round";
        this.svg.style.strokeLinecap = "round";
        this.svg.style.strokeMiterlimit = 100;
        this.svg.style.strokeDasharray = "none";
        this.svg.setAttribute("vector-effect","non-scaling-stroke");


        //this.svg.style.strokeDashoffset= 0;

        //<path stroke="#595959" stroke-opacity="1" stroke-width="381" stroke-linecap="butt" stroke-linejoin="square" stroke-miterlimit="8"></path>
        /*this.svg.setAttribute("stroke-line-join", "square")
        this.svg.setAttribute("stroke-line-cap", "round")
        this.svg.setAttribute("stroke-miterlimit", 8)*/
        this.canvasRect = this.group.getBoundingClientRect();
        this.transform.startPos = new Vector2(this.canvasRect.x, this.canvasRect.y);
        this.transform.pos = new Vector2(this.canvasRect.x, this.canvasRect.y);
     
    }

    

    setContent(){
        
    }

    addPoint(pos){
        this.path.push(pos);
        this.updatePath(pos.toString());
        //DELETE ME 
        return this;
    
    }

    getSerializableProperties(){
        return ["pathData"]
    }


    smoothify(){


        let tempPath = this.path.slice();
        let svgData = "";
        let start = tempPath.splice(0, 1);
        let lastPos = undefined;

        let skip = 0;
        let total = 0;
        let smoothed = false;
        let x = 0;
        while(tempPath.length >= 3) { 
            total+=1;
            let curve = tempPath.splice(0, 3);
            //if(lastPos!=undefined)console.log( curve[2].distance(lastPos));
            //20;
            if(lastPos!=undefined && curve[2].distance(lastPos) < 20){
                skip +=1;
               // lastPos = curve[2];
               //continue;
            }
            lastPos = curve[2];
            svgData += ` ${curve[0]} ${curve[1]} ${curve[2]}`;
            x+=3;
            smoothed = true;
        }

        if(!smoothed) return false;

        svgData = "M "+start.toString() + "C"+ svgData;
        let ogPath = this.replacePath(svgData);
        

        console.log(100 - ((x/this.path.length) * 100)+"% og smoothify compression")

        return true;
            /*
            let uncompressedSVG = new SVG(this.parentId, this.pos);

            uncompressedSVG.replaceSvg(ogPath);
            uncompressedSVG.svg.setAttribute('transform','translate(400,0)');*/
        
    }

    smootherfy(lineSegmentsOG, debug){
        this.drags = [];
        //console.log(lineSegmentsOG[0][0].distance(lineSegmentsOG.last().last()));
        if(lineSegmentsOG[0][0].distance(lineSegmentsOG.last().last()) < 50){
            //console.log("correct");
            let lastSeg = lineSegmentsOG[lineSegmentsOG.length - 1];

            console.log(lineSegmentsOG[lineSegmentsOG.length - 1][lastSeg.length -1] );
            lineSegmentsOG[lineSegmentsOG.length - 1][lastSeg.length -1] = lineSegmentsOG[0][0];

           // lastPoint = 
        }
        

        let lineSegments = [];
        this.path = [];
        
        console.log(lineSegmentsOG[lineSegmentsOG.length-1])

        for(let [i, line] of lineSegmentsOG.entries()){
        
            if(i>0 && (line.length<6 || lineSegments[lineSegments.length-1].length <6)){
                
                lineSegments[lineSegments.length-1] = lineSegments[lineSegments.length-1].concat(line)
                
            }else{
                lineSegments.push(line);
            }
            
        }
        console.log("last");
        console.log(lineSegments[lineSegments.length-1]);

        


        //counter clock is 1, clockwise is -1, 0 means you realllllyyyyy messed up cuz how.
        let getClock = (line) =>{
            let segStart = line[0];
            let segEnd = line.last();
            let segAdj = line[3];

            let baseAngle = segEnd.subtract(segStart).angleVector();
            let adjAngle = segAdj.subtract(segStart).angleVector();


            if(Math.abs(baseAngle-adjAngle) >180){
                if(baseAngle-adjAngle<0){
                    baseAngle+=360
                }else{
                    adjAngle+=360
                }
            }
            if(baseAngle>adjAngle) return -1;
            return 1;
            
       
        }

        let clockTotal = 0;
        for(let [i, line] of lineSegments.entries()){
       
           // if(i<lineSegments.length){
                
                let clock1 = getClock(line);
               // let clock2 = getClock(lineSegments[i+1]);
                
               // console.log(clock1);
               // console.log(clock2);
               // console.log("====================");

              
               // clockTotal += ct;
               // console.log(Math.sign(ct));
                line.dir = Math.sign(clock1);
               // console.log("clock dir "+Math.sign(clock));
        //    }else{
          //      line.dir = Math.sign(clockTotal);
           // }
            //line.dir = 1;
        }
        
       
     //   let clockwise = Math.sign(clock) * -1;
      //  console.log("clock: "+clockwise);


        console.log("\nSEGMENTS");
        console.log(JSON.parse(JSON.stringify(lineSegments)));
       
        let end = lineSegments[0][0];
        if(debug)this.dragify(debugRect2(end, 15, "green", "same"));
        let svgData = "M "+end.toString()+" C ";
        this.path.push(end);
        //pick points that are same distance apart for the controls
        for(let [i, line] of lineSegments.entries()){
            let controlRot = bend;

            //get the center point between the line [done]
            //offset both controls but 1/3 of the length of the line from the midpoint [done]
            //rotate both controls around their point by the angle in between them & the curve apex
            
           
            let nextSegment = lineSegments[i+1];
            let nextEnd = (nextSegment!==undefined) ?  nextSegment[nextSegment.length-1] : null;
           // let nextStart = nextSegment[0][0];
            
            let controlList = [];
            //if(nextStart == null )continue;
           
                let distFourth = end.distance(line[line.length-1])/4;
           
          
                let dist = 0;
                for(let [j, point] of line.entries()){
                    if(j > 0){
                        dist += point.distance(line[j-1]);
                        if(dist >= distFourth){
                            controlList.push(point);
                            if(controlList.length==2)break;
                            dist = 0;
                        }
                    }
                }
                let lastEnd = end.clone();
                end = line[line.length-1];

           // }
               // console.log("ctr: "+controlList.length);
          //      if(controlList.length<2)continue;

            let c1 = controlList[0];
            let c2 = controlList[1];

            /*
            let midpoint = Math.ceil(line.length / 2);
           

            let c1 = line[Math.floor(midpoint/2)-1];
            
            let c2 = line[(line.length-1) - Math.ceil(midpoint/2)]*/

            
            console.log("\n");
           // console.log((lastEnd.y - end.y) / (lastEnd.x - end.x));

        
           // console.log("\n");
            
            c1 = c1.rotateAround(lastEnd, -(controlRot * line.dir));
            c2 = c2.rotateAround(end, (controlRot * line.dir));
            if(debug){
                
                let _lastEnd = lastEnd.clone();
                let _end = end.clone();
                setTimeout(()=>{
                    let p1 = new SVGPath(canvas, c1, "fewfeewf").addPoint(_lastEnd);
                    let p2 = new SVGPath(canvas, c2, "fewfeewf").addPoint(_end);
                    
                    let d1 = this.dragify(debugRect2(c1, 15, "yellow", "same"), c1, p1);
                    let d2 = this.dragify(debugRect2(c2, 15, "yellow", "same"), c2, p2);
                    if(this.back2TheFuture!==undefined)this.back2TheFuture(d1);
                    
                    this.back2TheFuture = (future)=>{ this.dragify(debugRect2(_end, 15, "red", "same"), _end, undefined, future, d2)};
                    

                  //  new SVGText(canvas, _end.add(new Vector2(10,10)), "fijew", line.dir)
                },0);
                
                
            }

            svgData += `${c1} ${c2} ${end} `;
            this.path.push(c1);
            this.path.push(c2);
            this.path.push(end);
           
            //let c1 = line[ Math.floor(midpoint/2)].rotateAround(start, -anchorRot);
        }
        
        

        console.log(svgData);
        this.replacePath(svgData);
        return this;
       // this.svg.style.transform = "translate(500, 0)"
    }

    //M 3211.0 2968.0C 3041.8 3306.4 3133.6 3752.8 3299.2 3765.4 L3238.0 2933.8L3020.2 3589.0L3027.4 3625.0L3133.6 3752.8L3178.6 3770.8L3333.4 3747.4L3403.6 3682.6

    //replaces path
    replacePath(updateSvg){
        let ogPath = this.pathData;
        this.pathData = updateSvg;
        //console.log(updateSvg);
        this.svg.setAttribute("d", updateSvg);
        return ogPath;
    }
    //adds things to the path
    updatePath(svgData){
        if(svgData ==""){
            this.delete()
            console.log("deleted svg cuz too small");
        }
        this.pathData += "L"+svgData;
        this.svg.setAttribute("d", this.pathData);
        
    }

    dragify(el, pos , line, a1, a2){
        el.style.opacity=0.5;
        
        let linePos = (line!==undefined) ? line.path[1] : null;

        let updateLinePos = (newPos)=>{
            linePos = newPos;
            update(new Vector2(parseFloat(el.getAttribute("x")), parseFloat(el.getAttribute("y"))));
        };

        let update = (newPos)=>{
          
            let cpos = new Vector2(parseFloat(el.getAttribute("x")), parseFloat(el.getAttribute("y")));
      
            
            this.pathData = this.pathData.replace(cpos.toString(), newPos.toString());
            this.replacePath(this.pathData);
           
            el.setAttribute("x", newPos.x);
            el.setAttribute("y", newPos.y)
            
            if(line!==undefined){
                //console.log(line);
                line.delete();
                line = new SVGPath(app.canvas, linePos, "foekf");
                line.addPoint(newPos);
            }

            if(a1 !==undefined)a1(cpos);
                
            if(a2 !==undefined)a2(cpos);
            
        };

        $(el).on("mousedown",(e)=>{
            let lastTool = app.currentTool;
            app.currentTool = -69;
            
            console.log("LINE POS");
            console.log(line);
            console.log("END LINE POS");
            if(line!==undefined) line.svg.style.opacity = 0.5;
            $(document).on("mousemove.drag",(e)=>{
                e.stopPropagation();
                e.preventDefault();
                update(getMousePos());
            });
            $(document).on("mouseup.up",(e)=>{
                $(document).off("mousemove.drag");
                $(document).off("mousemove.up");
                app.currentTool = lastTool;
            });
        });
        return updateLinePos;
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


}