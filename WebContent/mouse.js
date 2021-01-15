class Mouse{

    constructor(pos){
        this.pos = pos;
        let svg = document.createElementNS("http://www.w3.org/2000/svg", 'image');
        svg.setAttribute("x", this.pos.x);
        svg.setAttribute("y", this.pos.y);
        svg.setAttribute("width", "40");
        svg.setAttribute("height", "40");
        svg.setAttribute("href", path+"/images/icons/point2.svg");
        canvas.appendChild(svg);
        this.svg = svg;
        this.animating = false;
    }

    moveTo(pos){
        this.pos = pos;
        this.svg.setAttribute("x", this.pos.x);
        this.svg.setAttribute("y", this.pos.y);
    }

    moveToPath(path, start){
        if(start!==undefined)this.moveTo(start);
        //path = [this.pos].concat(path);
        //console.log(path.length);
        this.animating = true;
       // console.log(path.length);
        let self = this;
        let startPos = this.pos
        let pos = path.splice(0, 1)[0];
       
        //console.log(pos);
        animate({
            duration: 100,
            timing(timeFraction) {
                return timeFraction
            },
            draw(progress) {
                let dest = startPos.moveTowards(pos, progress);
                self.moveTo(dest);
            
            },
            completed(){

                if(path.length>1){
                    self.moveToPath(path);
                }else{
                    self.animating = false;
                }
            }
        });
    }


}