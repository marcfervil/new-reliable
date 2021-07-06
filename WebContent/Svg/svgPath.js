

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
     
        this.dragifies = [];
        this.things = [];
      // console.log(this.svg)
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
        if(lineSegmentsOG[0]==undefined) {
            this.delete();
            return;
        }
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


        let getControls = (line)=>{

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
               

          
            return controlList;
        }

        console.log("\nSEGMENTS");
        console.log(JSON.parse(JSON.stringify(lineSegments)));
       
        let end = lineSegments[0][0];
        
        
        //if(debug)this.dragify(debugRect2(end, 15, "green", "same"));
        let first = true;
 
        let firstUpdate = null;
        if(debug){
            let myEnd = end.clone();
            setTimeout(()=>{
               // console.log(first)
              // this.dragify(debugRect2(end, 15, "green", "same"), end, undefined, future);};
                //this.dragify(debugRect2(myEnd, 15, "green", "same"), null, first, );
               // console.log(first.svg)
            },10)
            
            //this.dragify(debugRect2(end, 15, "red", "same"), end, undefined, future, undefined)
          //  dragify(el, /pos/ , line, a1, a2){
            //this.back2TheFuture = (future)=>{  this.dragify(debugRect2(end, 15, "green", "same"), end, undefined, future);};
        }


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
            

            /*
            let midpoint = Math.ceil(line.length / 2);
           

            let c1 = line[Math.floor(midpoint/2)-1];
            
            let c2 = line[(line.length-1) - Math.ceil(midpoint/2)]*/

            
            console.log("\n");
           // console.log((lastEnd.y - end.y) / (lastEnd.x - end.x));
          
        
           // console.log("\n");
            let controlList = getControls(line);
           let c1 = controlList[0];
           let c2 = controlList[1];
           let lastEnd = end.clone();
           end = line[line.length-1];

           c1 = c1.rotateAround(lastEnd, -(controlRot * line.dir));
           if(false && nextSegment!==undefined){
               let nextc1 = getControls(nextSegment)[0].rotateAround(nextEnd, (controlRot * nextSegment.dir));
               //setTimeout(()=>{new SVGPath(canvas, c2, "fewfeewf").addPoint(nextc1).svg.style.stroke="black"},20);
               
                //Vector3 newSpot = o ldSpotVector3 + (directionVector3.normalized * distanceFloat);
               // c2 = c2.rotateAround(end, (controlRot * line.dir ));
           
                let dist = c2.distance(end);
                let dir = end.subtract(nextc1).normalize();
               c2 = end.add(dir.scale(dist));
                //c2 = c2.rotateAround(end, (controlRot * line.dir ));
               
           }else{
                c2 = c2.rotateAround(end, (controlRot * line.dir ));
           }

          
          
        

            
         

            this.lastc2 = c2;
            this.lastc1 = c1;

            svgData += `${c1} ${c2} ${end} `;
            this.path.push(c1);
            this.path.push(c2);
            this.path.push(end);
           
            //let c1 = line[ Math.floor(midpoint/2)].rotateAround(start, -anchorRot);
        }
        
        this.createPointHandles();

      
        this.replacePath(svgData);


        //console.log("dragif",this.dragifies)
        

        this.createRotHandle(true);


        this.smoothed = true;
        return this;
       // this.svg.style.transform = "translate(500, 0)"
    }

    createPointHandles(debug=true){
        if(debug){
            let handlePaths = this.path.map((vec)=>vec.clone());
            let pathRects = []
            let index = 0;
            while(handlePaths.length>0){
                let point = handlePaths.pop();
                let c1 =  handlePaths.pop();
                let c2 = handlePaths.pop();
                let pointRect = debugRect2(point, 15, "red", "same");
 

                let c1Rect = debugRect2(c1, 15, "yellow", "same")
                let c2Rect = debugRect2(c2, 15, "blue", "same")
                this.things.push(c1Rect)
                this.things.push(c2Rect)
                this.things.push(pointRect)
                pathRects.push(pointRect, c1Rect, c2Rect)
                pathRects = pathRects.filter((item)=>item!=null)
            }
            console.log("rects",pathRects)
            for(let i = pathRects.length-3; i>=1; i--){
                //console.log("rwg",i,pathRects)
                let lastPoint = pathRects[i+1];
                let nextPoint = pathRects[i-1];
                
                pathRects[i].prev = (lastPoint!=null)?lastPoint : "root";
                pathRects[i].next = (nextPoint!=null)?nextPoint : "root";
            }
            
            //pathRects[pathRects.length-1].next =  pathRects[pathRects.length-2]
            pathRects[0].prev =  pathRects[1]
            console.log("fpoekweow", pathRects[pathRects.length-1].next)
            for(let i = 0; i<pathRects.length; i+=3){
                let point = pathRects[i];

             
                let c1 = pathRects[i-1];
                let d1 = null;
                if(c1!=null){
                    let p1 = new SVGPath(canvas, c1.pos, "fewfeewf").addPoint(point.pos);
                  
                    this.things.push(p1.svg)
                    d1 = this.dragify(c1, p1)
                }

                let c2 = pathRects[i+1];
                let d2 = null;
                if(c2!=null){

                    let p2 = new SVGPath(canvas, c2.pos, "fewfeewf").addPoint(point.pos);
                    this.things.push(p2.svg)
                    d2 = this.dragify(c2, p2)
                }
                
                this.dragify(point, null, d1, d2)
            }

        }
    }

    createRotHandle(){
        let r = this.svg.getBoundingClientRect();
        let svgPos = new Vector2(r.x, r.y);
        let rot = debugRect2(svgPos.add(new Vector2(r.width+50, 0)), 15, "purple", "same");
        

        let center = new Vector2(r.x + (r.width/2), r.y + (r.height/2))
       
        //debugRect2(center, 15, "black", "same");
        $(rot).on("mousedown", (e)=>e.stopPropagation());
       
        this.dragifies.forEach((drag)=>drag(drag.pos))
        $(rot).on("pointerdown", (e)=>{
            e.stopPropagation()
           // console.log(this.dragifies.map((m)=>m.color));
           
           let rotate = (drag, deg)=> {
                let dir = new Vector2(0, 100);
                //let newPos = drag.pos.add(dir);
                //
                let newPos = drag.pos.rotateAround(center, deg, false);
                //lastRot = newRot


                drag(newPos)
                drag(newPos);
            }
          
            let lastRot = 0;
            $(document).on("pointermove.rotSvg", (e)=>{
                //console.log()
                
                let deg = getMousePos().angle(rot.pos)
                let newRot = lastRot - deg;
                //console.log(newRot)
                this.dragifies.filter((drag)=>["red", "green"].includes(drag.color)).forEach((drag)=>rotate(drag, newRot))
                this.dragifies.filter((drag)=>drag.color!="red").forEach((drag)=>rotate(drag, newRot))
                lastRot = deg;
            });

            $(document).one("pointerup",()=>{
                e.stopPropagation();
                $(document).off(".rotSvg")
            })


        });
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

    getPercentageChange(oldNumber, newNumber){
        var decreaseValue = oldNumber - newNumber;
    
        return (decreaseValue / oldNumber) ;
    }

    dragify(el , line, a1, a2){
        el.style.opacity=0.3;
        //this.group.append(el);
        //console.log("dragified", arguments)
        if(line!=null){
           // console.log(line.svg)
            setTimeout(()=>{
                line.svg.style.opacity = 0.5;
            },0)
            
        }
        let linePos = (line!=null) ? line.path[1] : null;
        if(line!=null)line.svg.style.opacity = 0.3;
        let updateLinePos = (newPos)=>{
            linePos = newPos;
            update(new Vector2(parseFloat(el.getAttribute("x")), parseFloat(el.getAttribute("y"))));
        };
        //updateLinePos.pos = linePos;
        let lastTool = app.currentTool;
        let update = (newPos, organic)=>{
            
            update.pos = newPos;
            if(organic){
               // update.ogPos = update.pos.clone()
               // el.ogPos = update.pos.clone()
            }
            let cpos = new Vector2(parseFloat(el.getAttribute("x")), parseFloat(el.getAttribute("y")));
            //console.log("few", a1, a2)
            
            this.pathData = this.pathData.replace(cpos.toString(), newPos.toString());
            this.replacePath(this.pathData);
           
            el.setAttribute("x", newPos.x);
            el.setAttribute("y", newPos.y);
            
            if(line!=null){
                //console.log(line);
                line.delete();
                line = new SVGPath(app.canvas, linePos, "foekf");
                //console.log("move rig",this.svg)
                if(this.isRiggged)line.svg.style.opacity=0;
                line.addPoint(newPos);
            }
           // if(el.style.fill=="red")console.log(Math.random(),"few",a1,a2,"end")

            if(a1 !=null)a1(cpos, el.style.fill == "red", organic);
                
            if(a2 !=null)a2(cpos,  el.style.fill == "red", organic);
            
        };
        update.pos = new Vector2(parseFloat(el.getAttribute("x")), parseFloat(el.getAttribute("y")));
        update.ogPos = update.pos.clone()
        //el.style.fill = "black"
        update.id=Math.random();
        $(el).on("pointerdown",(e)=>{
            e.stopPropagation();
            lastTool = app.currentTool;
            app.currentTool = -69;
            
            //console.log("LINE POS");
            //console.log(line);
            //console.log("END LINE POS");
           if(line!=null) line.svg.style.opacity = 0.5;
           console.log(el.next, el.prev)
            let lastRot = update.pos.angle(el.prev?.update.pos || el.next.update.pos)
          
            $(document).on("mouseup.up", (e)=>{
                // if(a1 !==undefined && )
                 $(document).off("mousemove.drag");
                 $(document).off("mousemove.up");
                 app.currentTool = lastTool;
                 if(line!=null)line.svg.style.opacity = 0.3;
                 canvas.appendChild(el);
                 if(this.isBonerig){
                    Line.frame[update] = update.pos;
                 }
             });  
            
            $(document).on("mousemove.drag",(e)=>{
                e.stopPropagation();
                e.preventDefault();
               // console.log(this.isBonerig)
                if(!e.shiftKey && !this.isBonerig){
                    update(getMousePos(),true);
                
                }else{
                   // update(getMousePos());
                    //rotateAround()
                    //el.prev

                    let pivot = el.prev?.update.pos ||  el.next.update.pos
                    let deg = getMousePos().angle(pivot)
                    let newRot = lastRot - deg;

                    let change = this.getPercentageChange(lastRot, newRot)
                   // console.log(update.pos.rotateAround(el.prev.update.pos, newRot))
                    update(update.pos.rotateAround(pivot, newRot))
                    let line = el.next;
                    //console.log(line)
                    let dist = 1;
                    let sig = Math.random()
                    while(line!=null){
                        let newUpdate = line.update;
                        if(newUpdate == null)break;
                        //if(dist>1)break;
                        newUpdate(newUpdate.pos.rotateAround(pivot, newRot))
                        //newRot*=-0.9;
                       // console.log(newRot)
                        line = newUpdate.el.next
                        
                        
                       // console.log("----------------------")
                        if(this.bones!=null){
                            this.bones.dragifies.filter((drag)=>drag.el.ogPos.distance(newUpdate.ogPos)< 300).forEach((drag)=>{
                               
                                //console.log(drag.dragId)
                                window.requestAnimationFrame(()=>{
                                    if(drag.sig ==sig){
                                      //  console.log("no sig")
                                        return;
                                    }
                                    drag.sig = sig;
                                    
                                    //drag(drag.pos.rotateAround(pivot, newRot), null)
                                   // if(drag.lastRot==null)drag.lastRot = pivot.angle()
                                //   console.log(newRot/dist)
                                    drag(drag.pos.rotateAround(pivot, newRot), null)
                                })
                                
                            })
                        }
                        dist +=1;
                       // dist+=1;
                    //    console.log("----------------------")
                    }
                  //  console.log(dist)
                    
                   

                    lastRot = deg;
                }
                
            });
           
        });
        el.update = update;
        update.el = el;
        update.color = el.style.fill
        this.dragifies.push(update)
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