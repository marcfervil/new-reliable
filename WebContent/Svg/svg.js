

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

        //TODO: FIX RACE CONDITION
        //Is it a really a race condition if the timeout is 0?
        setTimeout(()=>{
            
            let rect = this.group.getBoundingClientRect();
            this.canvasPos = new Vector2(rect.x, rect.y).subtract(new Vector2(10, 10));
           
  
        },0)



        this.dragStartPos = null;

       
        this.transPos = new Vector2(0, 0);


    }

      //takes in a vector or something that has an x or a y 
    moveTo(pos){
  
        let delta = pos.subtract(this.canvasPos);
        this.group.setAttribute('transform', `translate(${delta.x}, ${delta.y})`);
        this.transPos = delta;

        if(this.dragStartPos==null){
       
            this.dragStartPos = pos;
        }else{
            this.dragEndPos = pos;
        }
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
        
        this.group.appendChild(selectRect);
        let margin = 10;

        selectRect.setAttribute('x', bounds.x - this.transPos.x - margin);
        selectRect.setAttribute('y', bounds.y - this.transPos.y - margin);
        //selectRect.setAttribute("transform", `translate(${bounds.x - margin}, ${bounds.y - margin})`)

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

   

    static getFromId(id){
        return $("#"+id)[0].reliableSvg;
    }

    static forEachSVG(ids, callback){
        for(let id of ids){
            callback($("#"+id)[0].reliableSvg);
        }
        
    }

    

}
