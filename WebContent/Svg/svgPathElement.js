
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
        for (var key in this.points) {
            if (this.points.hasOwnProperty(key)) {
                result += this.points[key] + " ";
            }
        }
        return result
    }

}

class MoveCommand extends SVGPathElement{

    constructor(point){
        super("M", {point});
    }

}

class LineCommand extends SVGPathElement{

    constructor(point){
        super("L", {point});
    }

}

class CurveToCommand extends SVGPathElement{

    constructor(handle1, handle2, end){
        super("C", {handle1, handle2, end})
    }

}
