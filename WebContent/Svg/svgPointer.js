class SVGPointer extends SVG{

    constructor(parent, pos, id){
        super("rect", parent, pos, id)

        this.svg.style.stroke = "#AAB2C0"; 
        //this.svg.style.fill = "orange";
        this.size = "30";
        this.svg.setAttributeNS(null, 'x', pos.x-(this.size/2));
        this.svg.setAttributeNS(null, 'y', pos.y-(this.size/2));
        this.svg.setAttributeNS(null, 'height', this.size);
        this.svg.setAttributeNS(null, 'width', this.size);
        this.svg.setAttributeNS(null, 'fill', '#'+Math.round(0xffffff * Math.random()).toString(16));
        //document.getElementById('svgOne').appendChild(rect);

    }

    updateLocation(pos){
        this.pos = pos;
        this.svg.setAttributeNS(null, 'x', pos.x-(this.size/2));
        this.svg.setAttributeNS(null, 'y', pos.y-(this.size/2));
        //this.svg.setAttribute("transform", "translate(100,100)");

    } 

    

    replacePath(updateSvg){
        let ogPath = this.pathData;
        this.pathData = updateSvg;
        this.svg.setAttribute("d", updateSvg);
        return ogPath;
    }


}