

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
        this.svg.setAttribute("vector-effect","non-scaling-stroke");

        this.svg = this.group.appendChild(this.svg);
        this.group = this.parent.appendChild(this.group);

        this.group.setAttribute("id", this.id);

        this.isSelected = false;
        this.isDragging = false;

        this.matrix = this.group.transform.baseVal.consolidate().matrix;

        //TODO: FIX RACE CONDITION
        //Is it a really a race condition if the timeout is 0?
        setTimeout(()=>{
            
            let rect = this.group.getBoundingClientRect();
            this.canvasPos = new Vector2(rect.x, rect.y).subtract(new Vector2(10, 10));
   
            this.moveTo(this.canvasPos);
        },0)



        this.dragStartPos = null;

        
        this.transPos = new Vector2(0, 0);


    }

    
    //takes in a vector or something that has an x or a y 
    moveTo(pos){
  
        let delta = pos.subtract(this.canvasPos);
        let action = `translate(${delta.x}, ${delta.y})`;
        this.group.setAttribute('transform', action);
        this.transPos = delta;
        
        if(this.dragStartPos==null){
       
            this.dragStartPos = pos;
        }else{
            this.dragEndPos = pos;
        }
        return action;
    }

    matrixTransform(x, y, xScale, yScale){
        
    }



    selectedMouseMove(e){

        if(this.isDragging){
     
            let clickPos = new Vector2(e.layerX, e.layerY);
            
            clickPos = this.clickOffset.subtract(clickPos).scale(-1);

            
            this.moveTo(clickPos);

        }
    }

    
    selectedMouseDown(e){
        e.stopPropagation();

        
 
        this.clickOffset = new Vector2(e.layerX, e.layerY);
        
       
        let svgPos = new Vector2(parseInt(e.srcElement.getAttribute("x")), parseInt(e.srcElement.getAttribute("y")));
        

        this.clickOffset =  this.clickOffset.subtract(svgPos).subtract(this.transPos);
        //this.clickBegin = this.lastPos;



        this.mouseMoveRef = (e) => this.selectedMouseMove(e);
        this.mouseUpRef = (e) => this.selectedMouseUp(e);

        this.parent.addEventListener('mousemove', this.mouseMoveRef);
        this.parent.addEventListener('mouseup', this.mouseUpRef);

        this.isDragging = true; 

    
    }

   

    selectedMouseUp(e){

      
        this.parent.removeEventListener('mousemove', this.mouseMoveRef);
        this.parent.removeEventListener('mouseup', this.mouseUpRef);

        
        //this.group.removeAttribute('transform');
        
        this.isDragging = false; 
       

        
       
        Action.commit(this.reliable, {
            action: "Drag",
            id: this.id,
            endPos: this.dragEndPos.toJSON(),
            startPos: this.dragStartPos.toJSON(),

           
            
        });  
        this.dragStartPos = null;
        
    }


    

    createSelectRect(){
        let bounds = this.group.getBoundingClientRect();
  
        let selectRect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        let selectRectGroup = document.createElementNS("http://www.w3.org/2000/svg", 'g');


       
        let margin = 10;

        let rectX = bounds.x - this.transPos.x - margin;
        let rectY = bounds.y - this.transPos.y - margin
        selectRect.setAttribute('x', rectX);
        selectRect.setAttribute('y', rectY);
        //selectRect.setAttribute("transform", `translate(${bounds.x - margin}, ${bounds.y - margin})`)

        let rectWidth = bounds.width + (margin *2);
        let rectHeight = bounds.height + (margin *2);
        selectRect.setAttribute('width', rectWidth);
        selectRect.setAttribute('height', rectHeight);
        selectRect.setAttribute("vector-effect","non-scaling-stroke");
        selectRect.style.stroke = "green";
        selectRect.style.fill = "transparent";

        

        selectRect.addEventListener('mousedown', (e) => this.selectedMouseDown(e));
        

        let rightDrag = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        let dragBoxSize = 10;
        rightDrag.setAttribute('x', rectX + rectWidth - (dragBoxSize/2));
        rightDrag.setAttribute('y', rectY + (rectHeight) - (dragBoxSize/2) );
        rightDrag.setAttribute('width', dragBoxSize);
        rightDrag.setAttribute('draggable', true);
        rightDrag.setAttribute('height', dragBoxSize);
        rightDrag.setAttribute("vector-effect","non-scaling-stroke");
        rightDrag.style.stroke = "red";
        rightDrag.style.fill = "red";
        

        

        rightDrag.addEventListener('mousedown', (mouseDown) => {
            let mouseStart = new Vector2(mouseDown.clientX, mouseDown.clientY);
            mouseDown.stopPropagation();
            mouseDown.preventDefault();
            this.group.setAttribute("transform", `translate(0, 0)`);
            
            let moveRef =  (e) => {moveEvent(e)};
            let upRef = (e) => {upEvent(e)}
            document.addEventListener('mousemove', moveRef);
            document.addEventListener('mouseup', upRef);

            let moveEvent = (mouseMove) => {
                //this.group.transform =Z 
                
                let mouseEnd = new Vector2(mouseMove.clientX, mouseMove.clientY);
                
                let delta = mouseEnd.subtract(mouseStart);

                let deltaPercent = new Vector2(delta.x/rectWidth, delta.y/rectHeight);
                //console.log(deltaPercent);
                //this.group.setAttribute("transform", `translate(0, 0) scale(${deltaPercent.x}, ${deltaPercent.y}) translate(0, 0)`);
               // this.group.setAttribute("transform", `scale(2, 2)`);
                
                
                //let pos = this.moveTo(new Vector2(x, y));
                this.group.style.transformOrgin = "100% 100%";
               // this.group.setAttribute("transform", `scale(2, 2)`);

                
                let neo = this.group.transform.baseVal.consolidate().matrix;
           

                neo.e = -(rect.left*deltaPercent.x);
                neo.f = -(rect.top*deltaPercent.y);

                //deltaPercent=new Vector2

                deltaPercent = deltaPercent.add(new Vector2(1,1))
                neo.a = deltaPercent.x ;
                neo.d = deltaPercent.y;
                let transVals = `matrix(${neo.a}, ${neo.b}, ${neo.c}, ${neo.d}, ${neo.e}, ${neo.f})`;
                
                this.group.setAttribute("transform", transVals);

                console.log();
            };

            let upEvent = (mouseUp) => {
                console.log("up??");
                document.removeEventListener('mousemove', moveRef);
                document.removeEventListener('mouseup', upRef);
            };

  

        });
        

        

        selectRectGroup.appendChild(selectRect);
        selectRectGroup.appendChild(rightDrag);

        
        this.group.appendChild(selectRectGroup);

        let rect = this.group.getBoundingClientRect();
        return selectRectGroup;
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

   

    static getFromId(id){
        return $("#"+id)[0].reliableSvg;
    }

    static forEachSVG(ids, callback){
        for(let id of ids){
            callback($("#"+id)[0].reliableSvg);
        }
        
    }

    

}
