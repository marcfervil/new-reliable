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
    }

    selectedMouseMove(e){
        console.log("dragging");
    }

    selectedMouseUp(e){
        this.parent.removeEventListener('mousemove', this.mouseMoveRef);
        this.parent.removeEventListener('mouseup', this.mouseUpRef);

        console.log("done dragging");
        this.isDragging = false; 
    }

    selectedMouseDown(e){
        e.stopPropagation();
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

    select(mySelection){
        if(this.isSelected) return;
        this.isSelected = true;
        this.selectRect = this.createSelectRect();
    }

    unselect(){
        this.isSelected = false;
        $(this.selectRect).remove();
    }

    delete() {
        $(this.group).remove();
    }

    static getFromId(id){
        return $("#"+id)[0].reliableSvg;
    }

    static forEachSVG(ids, callback){
        for(let id of ids){
            callback($("#"+id)[0].reliableSvg);
        }
        
    }

}
