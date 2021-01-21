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
        this.svg.style.strokeMiterlimit = 10;
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
        this.updatePath(pos.toString())
    
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

    smootherfy(lineSegmentsOG){
        console.log("smoother");
        let lineSegments = []
      
        for(let [i, line] of lineSegmentsOG.entries()){
            if(i>0 && line.length<5){
                
                lineSegments[lineSegments.length-1] = lineSegments[lineSegments.length-1].concat(line)
                
            }else{
                lineSegments.push(line);
            }
            
        }

        
        console.log("SEGMENTS");
        console.log(JSON.parse(JSON.stringify(lineSegments)));
        let svgData = "M ";
        let start = lineSegments[0].splice(0, 1).toString()+"C ";
        
        for(let [i, line] of lineSegments.entries()){
            
            let midpoint = Math.floor(line.length / 2);

           
            let c1 = line[ Math.ceil(midpoint/2)].toString();
            let c2 = line[(line.length-1)- Math.floor(midpoint/2)].toString();
            let end = line[line.length - 1].toString();

            /*
            console.log("\n---------------")
            console.log(start);
           
            console.log(c1);
            console.log(c2);
            console.log(end);
            console.log("\n---------------")*/

            svgData += `${start} ${c1} ${c2} ${end} `;
            console.log(`${i}: ${start}, ${c1}, ${c2}, ${end}`);
           

            if(i<lineSegments.length-1)start = lineSegments[i+1].splice(0, 1).toString()

        }
        console.log(svgData);
        this.replacePath(svgData);
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