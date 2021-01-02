class SVGPointer extends SVG{

    constructor(parent, pos, id){
        super("rect", parent, pos, id)

        this.svg.style.stroke = "#AAB2C0"; 
        //this.svg.style.fill = "orange";
        this.svg.setAttributeNS(null, 'x', pos.x);
        this.svg.setAttributeNS(null, 'y', pos.y);
        this.svg.setAttributeNS(null, 'height', '30');
        this.svg.setAttributeNS(null, 'width', '30');
        this.svg.setAttributeNS(null, 'fill', '#'+Math.round(0xffffff * Math.random()).toString(16));
        //document.getElementById('svgOne').appendChild(rect);

    }

    updateLocation(pos){
        let loc = "'translate("+pos.x+","+pos.y+"')"
        this.svg.setAttributeNS(null, 'x', pos.x);
        this.svg.setAttributeNS(null, 'y', pos.y);
        //this.svg.setAttribute("transform", "translate(100,100)");

    } 

    

    replacePath(updateSvg){
        let ogPath = this.pathData;
        this.pathData = updateSvg;
        this.svg.setAttribute("d", updateSvg);
        return ogPath;
    }


}