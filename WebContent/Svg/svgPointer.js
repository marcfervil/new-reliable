class SVGCursor extends SVG{

    constructor(parent, pos, id){
        super("rect", parent, pos, id)

        this.svg.style.stroke = "#AAB2C0"; 
        this.svg.style.fill = "orange";
        this.svg.style.strokeWidth = 3;
        this.svg.style.strokeLinejoin = "miter";
        this.svg.style.strokeLinecap = "butt";
        this.svg.style.strokeMiterlimit = 4;
        this.svg.style.strokeDasharray = "none";
        this.svg.style.strokeDashoffset= 0;

    }

    updateLocation(pos){
        let loc = "'translate("+pos.x+","+pos.y+"')"
        this.svg.setAttribute("transform", loc);

    } 

    

    replacePath(updateSvg){
        let ogPath = this.pathData;
        this.pathData = updateSvg;
        this.svg.setAttribute("d", updateSvg);
        return ogPath;
    }


}