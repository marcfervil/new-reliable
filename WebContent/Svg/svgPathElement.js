
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

    constructor(prefix, points){
        this.prefix = prefix;
        this.points = points
    }

    stringify(){
       // console.log("stringiyyyyyh")
        let result = this.prefix+ " ";
        for (let point of this.toArray()) {
            //if (this.points.hasOwnProperty(key)) {
                result += point + " ";
           // }
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

    constructor(point){
        super("M", {point});
    }

    last(){
        return this.points.point
    }

}

class LineCommand extends SVGPathElement{

    constructor(point){
        super("L", {point});
    }

    last(){
        return this.points.point
    }

}

class CurveCommand extends SVGPathElement{

    constructor(handle1, handle2, end){
        super("C", {handle1, handle2, end})
    }

    last(){
        return this.points.end
    }

}

