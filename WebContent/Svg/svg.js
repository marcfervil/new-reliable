

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

        this.group.setAttribute("transform", `translate(0, 0)`);
        this.matrix = this.group.transform.baseVal.consolidate().matrix;


        this.scaleDelta = new Vector2(1, 1);
        //console.log(this.matrix);
        //TODO: FIX RACE CONDITION
        //Is it a really a race condition if the timeout is 0?
        setTimeout(() => {
            
            this.canvasRect = this.group.getBoundingClientRect();
            this.canvasPos = new Vector2(this.canvasRect.x, this.canvasRect.y).subtract(new Vector2(10, 10));
            this.dragEndPos = this.canvasPos;
            //this.moveTo(this.canvasPos);


        }, 0)



        this.dragStartPos = null;

        
        this.transPos = new Vector2(0, 0);

       
    }

    
    //takes in a vector or something that has an x or a y 
    moveTo(pos){
  
        let delta = pos.subtract(this.canvasPos);
       
        this.matrixTransform(pos.x, pos.y);

        //this.matrixTranslate(pos)

        //let delta = pos.subtract(this.canvasPos);
        //let action = `translate(${delta.x}, ${delta.y})`;
        //this.group.setAttribute('transform', action);
        this.transPos = delta;
        this.lastPos = pos;
        if(this.dragStartPos==null){
       
            this.dragStartPos = pos;
        }
        this.dragEndPos = pos;
        
        return "action";
    }

    scaleTo(scaleDelta){
        let rect = this.group.getBoundingClientRect();
        
      
        this.matrixTransform(this.dragEndPos.x, this.dragEndPos.y, scaleDelta.x, scaleDelta.y);
        this.scaleDelta = scaleDelta;
    }

    matrixTransform(x, y, xScale, yScale){
        let rect = this.group.getBoundingClientRect();
        //let rect = this.group.getBoundingClientRect();
            
        /**
         
                //position
                neo.e = - (rect.left * deltaPercent.x);
                neo.f = - (rect.top * deltaPercent.y);

                //scale 
                deltaPercent = deltaPercent.add(new Vector2(1,1))
                neo.a = deltaPercent.x;
                neo.d = deltaPercent.y;
         */

        if(xScale===undefined && yScale===undefined){
            xScale = this.scaleDelta.x;
            yScale = this.scaleDelta.y;
 
        }
        let deltaPercent = new Vector2(xScale, yScale).subtract(new Vector2(1, 1));
        


        let pos = new Vector2(x, y);
        //let delta = pos.subtract(this.canvasPos);
        let delta = pos.subtract(this.canvasPos);
       // this.matrix.e = delta.x - (rect.left * deltaPercent.x);
       // this.matrix.f = delta.y - (rect.top * deltaPercent.y);
        
        this.matrix.e = delta.x  - ((this.canvasRect.left -10) * deltaPercent.x);
        this.matrix.f = delta.y  - ((this.canvasRect.top -10 )* deltaPercent.y);
        
        this.matrix.a = xScale;
        this.matrix.d = yScale;
        let transVals = `matrix(${this.matrix.a}, ${this.matrix.b}, ${this.matrix.c}, ${this.matrix.d}, ${this.matrix.e}, ${this.matrix.f})`;
        
        this.group.setAttribute("transform", transVals);
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

        let rectX = bounds.x - this.transPos.x - (margin * this.scaleDelta.x);
        let rectY = bounds.y - this.transPos.y - (margin * this.scaleDelta.y)
        selectRect.setAttribute('x', rectX);
        selectRect.setAttribute('y', rectY);
        //selectRect.setAttribute("transform", `translate(${bounds.x - margin}, ${bounds.y - margin})`)

        let rectWidth = (bounds.width/this.scaleDelta.x) + (margin *2);
        let rectHeight = (bounds.height/this.scaleDelta.y) + (margin *2);
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
        rightDrag.style.fill = "transparent";
        

        

        rightDrag.addEventListener('mousedown', (mouseDown) => {
            let mouseStart = new Vector2(mouseDown.clientX, mouseDown.clientY);
            mouseDown.stopPropagation();
            mouseDown.preventDefault();
            //this.group.setAttribute("transform", `translate(0, 0)`);
            
            let moveRef = (e) => {moveEvent(e)};
            let upRef = (e) => {upEvent(e)}
            document.addEventListener('mousemove', moveRef);
            document.addEventListener('mouseup', upRef);

            //this.scaleTo(new Vector2(2, 2));
            //let test = new SVGPath(this.parent, this.pos, this.id+"2");
            //test.replacePath(this.pathData);
            //test.createSelectRect();
            let startScale = this.scaleDelta.clone();
           let totalWidth = this.group.getBBox().width;
           let totalHeight = this.group.getBBox().height;
          
            console.log(totalWidth+","+totalHeight);
            console.log(this.scaleDelta);
            let moveEvent = (mouseMove) => {
                //this.group.transform =Z 
        

                let mouseEnd = new Vector2(mouseMove.clientX, mouseMove.clientY);
                
                let delta = mouseEnd.subtract(mouseStart);

                //multiply startScale by something to move anchor
                //let deltaPercent = new Vector2(delta.x/totalWidth, delta.y/totalHeight).add(startScale);

                let deltaPercent = new Vector2(delta.x/rectWidth, delta.y/rectHeight).add(startScale);


                //console.log(deltaPercent);
                //this.group.setAttribute("transform", `translate(0, 0) scale(${deltaPercent.x}, ${deltaPercent.y}) translate(0, 0)`);
               // this.group.setAttribute("transform", `scale(2, 2)`);
                
                this.scaleTo(deltaPercent);
               /*
                //let pos = this.moveTo(new Vector2(x, y));
                this.group.style.transformOrgin = "100% 100%";
               // this.group.setAttribute("transform", `scale(2, 2)`);

                
                let neo = this.group.transform.baseVal.consolidate().matrix;
           
                //position
                neo.e = - (rect.left * deltaPercent.x);
                neo.f = - (rect.top * deltaPercent.y);

                //scale 
                deltaPercent = deltaPercent.add(new Vector2(1,1))
                neo.a = deltaPercent.x;
                neo.d = deltaPercent.y;
                let transVals = `matrix(${neo.a}, ${neo.b}, ${neo.c}, ${neo.d}, ${neo.e}, ${neo.f})`;
                


                this.group.setAttribute("transform", transVals);*/

            };

            let upEvent = (mouseUp) => {
          
                document.removeEventListener('mousemove', moveRef);
                document.removeEventListener('mouseup', upRef);
            };

  

        });
        

        

        selectRectGroup.appendChild(selectRect);

        
        selectRectGroup.appendChild(rightDrag);

        
        this.group.appendChild(selectRectGroup);

        let rect = this.group.getBoundingClientRect();
        //console.log(rect);
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
