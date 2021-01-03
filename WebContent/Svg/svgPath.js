class SVGPath extends SVG{

    constructor(parent, pos, id){
        super("path", parent, pos, id)
        
        this.pathData = "M "+pos.toString();
        this.path = [pos];
        this.svg.setAttribute("d", this.pathData); 
        this.svg.style.stroke = "#AAB2C0"; 
        this.svg.style.fill = "transparent";
        this.svg.style.strokeWidth = 3;
        //this.svg.style.strokeLinejoin = "miter";
        this.svg.style.strokeLinecap = "butt";
        //this.svg.style.strokeMiterlimit = 4;
        this.svg.style.strokeDasharray = "none";
        //this.svg.style.strokeDashoffset= 0;

    }

    addPoint(pos){
        this.path.push(pos);
        this.updatePath(pos.toString())
    
    }



    smoothify(){


        let tempPath = this.path.slice();
        let svgData = "";
        let start = tempPath.splice(0, 1);
        let lastPos = undefined;

        let skip = 0;
        let total = 0;
        let smoothed = false;
        while(tempPath.length >= 3) { 
            total+=1;
            let curve = tempPath.splice(0, 3);
            //if(lastPos!=undefined)console.log( curve[2].distance(lastPos));
            //20;
            if(lastPos!=undefined && curve[2].distance(lastPos) < 50){
                skip +=1;
                //lastPos = curve[2];
                //continue;
            }
            lastPos = curve[2];
            svgData += ` ${curve[0]} ${curve[1]} ${curve[2]}`;
            smoothed = true;
        }

        if(!smoothed) return false;

        svgData = "M "+start.toString() + "C"+ svgData;
        let ogPath = this.replacePath(svgData);
    
        return true;
            /*
            let uncompressedSVG = new SVG(this.parentId, this.pos);

            uncompressedSVG.replaceSvg(ogPath);
            uncompressedSVG.svg.setAttribute('transform','translate(400,0)');*/
        
    }
    //replaces path
    replacePath(updateSvg){
        let ogPath = this.pathData;
        this.pathData = updateSvg;
        console.log(updateSvg);
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