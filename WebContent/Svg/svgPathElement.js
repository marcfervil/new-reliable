
    /*
    [
        Move: {
            points : {
                point: Vector2(0, 0)
            },
            toString(){
                //turn points into SVG string
                //ex: M 0 0
            }
        },

        CurveTo : {
            points: {
                control1: Vector2(1, 2), 
                control2: Vector2(4, 5),  
                end: Vector2(2, 3)
            },
            toString(){
                //turn points into SVG string
                //ex: C 1 2 4 5 2 3
            }
        }

    ]

*/



class SVGPathElement{

    constructor(prefix, points, parent){
        this.prefix = prefix;
        this.pointStorage = points
        this.parent = parent;
        //console.log("og transform ", parent.transform)
        
    }

    set points(val){
        this.pointStorage = val
    }


    get points(){
        //console.log("start")
        //console.log("ogpoing ",this.pointStorage)

        

        let translate = (point)=> {
            //console.log("recT ",this.parent.group.getBoundingClientRect());
            //let width = this.parent.group.getBoundingClientRect().width
            //let height = this.parent.group.getBoundingClientRect().height;

            let startPos = this.parent.transform.startPos;
            let pos = this.parent.transform.pos;//getPos();0.
            let translateOffset = startPos.subtract(pos)
            //translateOffset = translateOffset.subtract(new Vector2(width, height))
            let val = point.subtract(translateOffset)
            return val
        }

        let scale = (point)=>{
            //console.log("point ", point,"delta scale ", this.parent.transform.deltaScale)
            
            let multiplier = this.parent.transform.scale
            let offset = this.parent.transform.deltaScale

            point = point.multiply(multiplier)
            point = point.subtract(offset)
            return point
        }


        if(this.parent == null){
            return this.pointStorage}
        else{
            //console.log("transform ", this.parent.transform)
            let altered = {}
            for (var point in this.pointStorage) {
                
                let alteredPoint = this.pointStorage[point]
                //console.log("transform ", this.parent.pTransform())
                alteredPoint = scale(alteredPoint)
                alteredPoint = translate(alteredPoint)
                altered[point] = alteredPoint
                

            }
            //console.log("altered ", altered)
            //console.log("end")
            return altered
        }
        
    }


    stringify(){
       // console.log("stringiyyyyyh")
        let result = this.prefix+ " ";
        for (let point of this.toArray()) {
                result += point + " ";
        }
        return result
    }

    *[Symbol.iterator](){
        for (var key in this.points) {
            if (this.points.hasOwnProperty(key)) {
                yield this.points[key];
            }
        }
    }

    
    

    toArray(){
        let points = []
        for (var key in this.points) {
            if (this.points.hasOwnProperty(key)) {
                points.push(this.points[key])
            }
        }
        return points
    }


    
    //pointElements = moveto linecommand, linecommand

    //
    //input: 
    static toArray(pointElements){
 

        let points = []
        for (let pointElement of pointElements) {
            
            points = points.concat(pointElement.toArray())
            
        }
        return points
    }

}

class MoveCommand extends SVGPathElement{

    constructor(point,parent){
        super("M", {point},parent);
    }

    position(){
        return this.points.point
    }

}

class TemporaryCurveCommand extends SVGPathElement{

    constructor(point, Tvalue,parent){
        super("T", {point},parent);
        this.Tvalue = Tvalue;
    }

    position(){
        return this.points.point
    }


}

class LineCommand extends SVGPathElement{

    constructor(point,parent){
        super("L", {point},parent);
    }

    position(){
        return this.points.point
    }

}

class CurveCommand extends SVGPathElement{

    constructor(handle1, handle2, end,parent){
        super("C", {handle1, handle2, end},parent)
    }

    position(){
        return this.points.end
    }

}

