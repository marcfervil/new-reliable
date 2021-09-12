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
        setTimeout(() => {
            this.canvasRect = this.group.getBoundingClientRect();
            this.transform.startPos = new Vector2(this.canvasRect.x, this.canvasRect.y);
            this.transform.pos = new Vector2(this.canvasRect.x, this.canvasRect.y);
            //console.log("new start ", this.transform.startPos)
        }, 0);
       
        
        //this.transform.startPos =new Vector2(0,0)
        //this.transform.pos = new Vector2(0,0)
        //console.log("copnstruct transform ", this.pTransform())
        //console.log("svg transform", this.transform)

        //svg sync familiy start

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



    
    /**
     * takes a vector, moves it to said vector
     * @param {Vector2} pos will move svg to this position
    */
   /*
    moveTo(pos){
        //super.moveTo(pos)


        
        //our desired location is going to be the distance between our current position (pos), and our orgin (startPos)
        let selectMargin = new Vector2(5+this.getSelectMargin(), 5+this.getSelectMargin());
        if(this.isSelected)pos = pos.subtract(selectMargin);
        let newPos = pos.subtract(this.transform.startPos);
       
        
        //get the actual position of our svg 
        let svgBounds = this.group.getBoundingClientRect();
        let svgPos = new Vector2(svgBounds.x, svgBounds.y);

        
        //offset the position of the svg by the distance between our desired position and our actual position, then update the transformation matrix.
        //This is done because we always want the svg to be moved by the top left coordinate (the orgin), and when we scale an svg by a different anchor/orgin
        //our svg's actual position has been augmented and we need the position that we're dragging it to to reflect that
        //console.log("old path ", this.path)
        
        let dist = pos.subtract(svgPos);
        console.log("dist ", dist)
        for(let element of this.path){
            for(let point of element){
                let pp = point.add(dist)
                point.x = pp.x
                point.y = pp.y
            }
        }
        //console.log("new path ", this.path)
        
        //update the position of our svg
        if(this.isSelected)pos = pos.add(selectMargin);
        this.startPos = pos
        this.transform.pos = pos;
        this.pos = pos;

        this.updatePath()
        

    }
    */

    //sync family end

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
            "M" : (point) => new MoveCommand(point, this),
            "L" : (point) => new LineCommand(point, this),
            "C" : (handle1, handle2, end) => new CurveCommand(handle1, handle2, end,this)
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
        this.path = this.path.concat(new LineCommand(pos,this));
        //this.updatePath()
        
    }



    smoothify(){
 
        let pathList = [this.path.splice(0,1)[0]]
        while(this.path.length>3){
            //grabbing first 3 elements to create a curve. Appending curve to path.
            pathList.push(new CurveCommand( ...SVGPathElement.toArray(this.path.splice(0,3)),this))
        }
        this.path = pathList
      
        return true;
    }
    
    
    


}