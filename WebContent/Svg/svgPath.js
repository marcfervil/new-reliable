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
       
        let lineSegments = [];
        this.path = [];
        
        for(let [i, line] of lineSegmentsOG.entries()){
        
            if(i>0 && (line.length<6 || lineSegments[lineSegments.length-1].length <6)){
                
                lineSegments[lineSegments.length-1] = lineSegments[lineSegments.length-1].concat(line)
                
            }else{
                lineSegments.push(line);
            }
            
        }
        let clock = 0;
        for(let line of lineSegments){
       
            
            let  segStart = line[0];

            let  segEnd = line[line.length-1];
           
           //  console.log(segEnd)
            // let f = (segEnd.x - segStart.x ) * (segEnd.y + segStart.y);
            clock += (segStart.x - segEnd.x ) * (segStart.y + segEnd.y);
            
        }
        
       
         let clockwise = Math.sign(clock) * -1;
        console.log("clock: "+clockwise);


        console.log("\nSEGMENTS");
        console.log(JSON.parse(JSON.stringify(lineSegments)));
       
        let end = lineSegments[0][0];
        if(debug)debugRect2(end, 10, "green", "same");
        let svgData = "M "+end.toString()+" C ";
        this.path.push(end);
        //pick points that are same distance apart for the controls
        for(let [i, line] of lineSegments.entries()){
            let controlRot = 5;

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
        
                if(controlList.length<2)continue;

            let c1 = controlList[0];
            let c2 = controlList[1];

            /*
            let midpoint = Math.ceil(line.length / 2);
           

            let c1 = line[Math.floor(midpoint/2)-1];
            
            let c2 = line[(line.length-1) - Math.ceil(midpoint/2)]*/

            
            console.log("\n");
           // console.log((lastEnd.y - end.y) / (lastEnd.x - end.x));

        
           // console.log("\n");
            
            c1 = c1.rotateAround(lastEnd, -(controlRot * clockwise));
            c2 = c2.rotateAround(end, (controlRot *clockwise));
            if(debug){
                new SVGPath(canvas, c1, "fewfeewf").addPoint(lastEnd).svg.style.opacity = 0.5;
                new SVGPath(canvas, c2, "fewfeewf").addPoint(end).svg.style.opacity = 0.5;

                debugRect2(c1, 10, "yellow", "same");
                debugRect2(c2, 10, "yellow", "same");
                debugRect2(end, 10, "red", "same");
            }

            svgData += `${c1} ${c2} ${end} `;
            this.path.push(c1);
            this.path.push(c2);
            this.path.push(end);

            //let c1 = line[ Math.floor(midpoint/2)].rotateAround(start, -anchorRot);
        }
        
        console.log(Math.sign(clock));

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