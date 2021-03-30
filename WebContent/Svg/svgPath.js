/**
 * SvgPath manages SVGPaths otherwise more simply known as the lines you see and draw on the whiteboard. 
 * 
 * SVGPaths are represented by arrays of SVGPathElements that can translated into a string to be displayed with the updatePath function
 */
class SVGPath extends SVG{

    constructor(parent, pos, id, pathData){
        super("path", parent, pos, id);

        this.pathData = (pathData===undefined) ? "M " + pos.toString() : pathData;
        this.pathData.trim()
        
        this.path = this.generatePath();
        

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

        

        this.targetProxy = new Proxy(this, {
            set: function (target, key, value) {
                target[key] = value;
                
                if(key == "pathData")target.path = target.generatePath();
                
                if(key == "path" || key == "pathData") target.updatePath();

                return true;
            }
            
        });
        this.reliableSvg = this.targetProxy;
        this.group.reliableSvg = this.targetProxy;
        return this.targetProxy;
       
    }

    

    getSerializableProperties(){
        return ["pathData"]
    }

    static stringifyPath(svgElementPath){
        let result = ""
        for(let svgElement of svgElementPath){
            result += svgElement.stringify()
        }
        return result;
    }
    
    generatePath(){
        
        let svgElementList = [];
        //map that creates the right svgElement based on a letter
        let svgCommands = {
            "M" : (point) => new MoveCommand(point),
            "L" : (point) => new LineCommand(point),
            "C" : (handle1, handle2, end) => new CurveCommand(handle1, handle2, end)
        }

        //turns a list of points into a list of vector2
        let vectorize = (list) => {
            let newVectors = [];
            while(list.length > 0) newVectors.push(new Vector2(...list.splice(0, 2).map(value => parseFloat(value))));
            return newVectors;
        }

        //while loops through the string after converting to an array of chars
        let pathData = this.pathData.split(" ");
       
        //loop thru pathData 
        while(pathData.length > 0){
            //grabs the first letter
            let commandLetter = pathData.splice(0,1)
            let command = svgCommands[commandLetter];
            //TODO: why is the below line needed? find a way to remove it!!! >:(
            if(commandLetter[0]=="") continue;
    
            //console.log(commandLetter);
            //grabs the apropriates ammount of numbers to turn into vectors to then turn into svg elements
            svgElementList.push(command(...vectorize(pathData.splice(0, command.length * 2))));
        }
        
        return svgElementList
        
    }

    updatePath(){   
        let newPath = SVGPath.stringifyPath(this.path)
        this.pathData = newPath
        this.svg.setAttribute("d", newPath);
    }   

    addPoint(pos){
        this.path = this.path.concat(new LineCommand(pos));
        //this.updatePath()
        
    }



    smoothify(){
 
        let pathList = [this.path.splice(0,1)[0]]
        while(this.path.length>3){
            //grabbing first 3 elements to create a curve. Appending curve to path.
            pathList.push(new CurveCommand( ...SVGPathElement.toArray(this.path.splice(0,3)) ))
        }
        this.path = pathList
      
        return true;
    }
    
    
    


}