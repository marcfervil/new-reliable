//eraser tool for erasing.

class Eraser extends Tool{

    constructor(){
        super("Eraser", "images/eraser.svg");
    }


    canvasDragStart(pos){
        this.svgRect = new SVGPointer(this.reliable.canvas, pos)
    }

    canvasDrag(pos){
        this.erase();
        this.svgRect.updateLocation(new Vector2(pos.x, pos.y));
    }


    canvasDragEnd(){
    
        //this.erase();
        this.svgRect.delete();
    }

    svgCollisions(){
        let svgRect = this.reliable.canvas.createSVGRect();

        svgRect.x = this.svgRect.pos.x;
        svgRect.y = this.svgRect.pos.y;
        svgRect.width = this.svgRect.size;
        svgRect.height = this.svgRect.size;
        
        let hits = this.reliable.canvas.getIntersectionList(svgRect, null);
        let realHits = [];
        for(let hit of hits)if(hit.parentNode.id != this.svgRect.id && hit.parentNode.id != "canvas")realHits.push(hit.reliableSvg);
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



    isCollidingLineSegment(path){
        path[1] = path[1].slice(0,path[1].length-1); //removes the 1 c

        let removeIndex = [];
        for(let i = 0; i<path.length; i+=2){
            let j = i+1;

            let x = path[i];
            let y = path[j];
            if(this.insideCursor(x,y)){
                removeIndex.push(i) 
            }
        }
        let minIndex = Math.min(...removeIndex)
        let maxIndex = Math.max(...removeIndex)
        //path.splice(minIndex, (maxIndex-minIndex)+2);
        let temp = path.splice(minIndex, path.length)
        temp.splice(0,Math.min((maxIndex-minIndex)+2, temp.length));
        let paths = []
        paths.push(path)
        
        if(temp.length>0){
            paths.push(temp)
        }
        return paths
    }
    
    lineSegmentColisions(svgs){
        let eraseables = []
        for(let svg of svgs){
            let edited = svg.pathData.split(" ")
           
            let paths = this.isCollidingLineSegment(edited.splice(1,edited.length)); //gets rid of the M
            let firstPass = true;
            for(let temp of paths){
                //temp.length-2 has to be divisable by 6
                if(!(temp.length<8)){
                    while((temp.length-2)%6 !=0){
                        temp.push(temp[temp.length-2])
                        temp.push(temp[temp.length-2])
                    }
                    temp[1] = temp[1]+"C"
                    temp = "M "+temp.join(" ")
                    eraseables.push(temp)
                    if(firstPass){
                        Action.commit(this.reliable,{
                            action: "Replace",
                            SVGID: svg.id,
                            newPath: temp
                        })
                        svg.replacePath(temp);
                        firstPass = false;
                    }
                    else{
                        Action.commit(this.reliable, {
                            action: "Draw",
                            id: Reliable.makeId(10) ,
                            path: temp,
                            color: "#AAB2C0"
                        })
                    }
                }else{
                    if(firstPass){
                        //svg.replacePath(temp)
                        Action.commit(this.reliable,{
                            action: "DeleteSVGPath",
                            id: svg.id
                        })

                        //svg.delete();
                    }
                }
                firstPass = false;
            }
        }
        return eraseables;
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