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
    
        this.erase();
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
        let x1 = this.svgRect.pos.x;
        let y1 = this.svgRect.pos.y;
        let x2 = x1+this.svgRect.size;
        let y2 = y1+this.svgRect.size;
        return (x > x1 && x < x2) && (y > y1 && y < y2)
    }

    isCollidingLineSegment(path){
        path[1] = path[1].slice(0,path[1].length-1); //removes the 1 c
        console.log(path)
        for(let i = 0; i<path.length; i+=2){
            for(let j =1; j<path.length; j+=2){
                let x = path[i];
                let y = path[j];
                if(this.insideCursor(x,y)){
                    path.splice(i,2); //removes the coords but does not readjust
                }
            }
        }
        return path
    }
    
    lineSegmentColisions(svgs){
        let eraseables = []
        for(let svg of svgs){
            let edited = svg.pathData.split(" ")
            svg.setPath(eraseables.push(this.isCollidingLineSegment(edited.splice(1,edited.length)))) //this splice removes the m from the begining
        }
        return eraseables;
        //console.log(test);
    }
    erase(){
        this.lineSegmentColisions(this.svgCollisions());
        
    }


}

