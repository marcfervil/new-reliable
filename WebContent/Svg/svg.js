class SVG{


    constructor(type, parent, pos, id) {
        this.parent = parent;
        this.pos = pos;
        this.id = (id==undefined) ? Reliable.makeId(10) : id;
        this.type = type;

        this.group = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", this.type);

        this.group.reliableSvg = this;
        this.svg.reliableSvg = this;

        this.svg = this.group.appendChild(this.svg);
        this.group = this.parent.appendChild(this.group);

        this.group.setAttribute("id", this.id);

        this.isSelected = false;
        this.isDragging = false;

        this.clickPos = new Vector2(0, 0);
        this.lastPos = {x: 0, y:0};
    }

    selectedMouseMove(e){
        if(this.isDragging){
            //console.log("dragging");
            let deltaX = e.offsetX - this.clickStart.x;
            let deltaY = e.offsetY - this.clickStart.y;
            let delta = new Vector2(deltaX, deltaY);
            //console.log(delta);
            this.newpos = this.clickPos.add(delta);
            
            this.moveTo(this.newpos);
        }
    }

    //takes in a vector or something that has an x or a y 
    moveTo(pos){
        this.lastPos = pos;
        this.group.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);
    }

    static getFromId(id){
        return $("#"+id)[0].reliableSvg;
    }

    selectedMouseUp(e){
        this.parent.removeEventListener('mousemove', this.mouseMoveRef);
        this.parent.removeEventListener('mouseup', this.mouseUpRef);


        this.clickPos = this.newpos;
        
        this.isDragging = false; 
        console.log(this);
        Action.commit(this.reliable, {
            action: "Drag",
            id: this.id,
            endPos: {
                x: this.newpos.x,
                y: this.newpos.y,
            },
            startPos: {
                x: this.clickBegin.x,
                y: this.clickBegin.y,
            }
        });   
    }


    

    selectedMouseDown(e){
        e.stopPropagation();

        this.clickStart = {x: e.offsetX, y:e.offsetY};
        this.clickOffset = {x: e.layerX, y:e.layerY};
        console.log(this.group);
        this.clickBegin = this.lastPos;



        this.mouseMoveRef = (e) => this.selectedMouseMove(e);
        this.mouseUpRef = (e) => this.selectedMouseUp(e);

        this.parent.addEventListener('mousemove', this.mouseMoveRef);
        this.parent.addEventListener('mouseup', this.mouseUpRef);

        this.isDragging = true; 

        console.log("Start drag");
    }

    createSelectRect(){
        let bounds = this.group.getBoundingClientRect();
        let selectRect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        
        this.group.appendChild(selectRect);
        let margin = 10;

        selectRect.setAttribute('x', bounds.x - margin);
        selectRect.setAttribute('y', bounds.y - margin);
        selectRect.setAttribute('width', bounds.width + (margin *2));
        selectRect.setAttribute('height', bounds.height + (margin *2));
        selectRect.style.stroke = "green";
        selectRect.style.fill = "transparent";



        selectRect.addEventListener('mousedown', (e) => this.selectedMouseDown(e));
        


        return selectRect;
    }


    
    select(reliable, mySelection){
        this.reliable = reliable;
        if(this.isSelected) return;
        this.isSelected = true;
        this.selectRect = this.createSelectRect();
    }

    unselect(reliable){
        this.reliable = reliable;
        this.isSelected = false;
        $(this.selectRect).remove();
    }

    delete() {
        $(this.group).remove();
    }

    

}
