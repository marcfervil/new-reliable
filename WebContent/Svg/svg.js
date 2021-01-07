




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

        this.scaleAnchor= new Vector2(1, -1);
        this.transformAnchor = {x: "left", y:"top"};

        this.totalScale = new Vector2(1, 1);
        //console.log(this.matrix);
        //TODO: FIX RACE CONDITION
        //Is it a really a race condition if the timeout is 0?
        setTimeout(() => {
            
            this.canvasRect = this.group.getBoundingClientRect();
            this.canvasPos = new Vector2(this.canvasRect.x, this.canvasRect.y).subtract(new Vector2(10, 10));
            this.dragEndPos = this.canvasPos;
            
            this.transform = {
                startPos : new Vector2(this.canvasRect.x, this.canvasRect.y),
                pos:  new Vector2(this.canvasRect.x, this.canvasRect.y),
                translatedPos: new Vector2(0, 0),
                startMatrix: this.group.transform.baseVal.consolidate().matrix
            }
            
            //this.moveTo(this.canvasPos);


        }, 0)
   


        this.dragStartPos = null;

        
        this.transPos = new Vector2(0, 0);

        
    }

    
    
    moveTo(pos){
        
        let newPos = pos.subtract(this.transform.pos);
        //console.log(newPos);

       this.group.transform.baseVal.consolidate().setMatrix(this.transform.startMatrix);
        //console.log(newPos);

        
    
        this.matrix = this.matrix.translate(newPos.x, newPos.y);
        //console.log(this.matrix);

        //console.log(this.group.transform.baseVal.consolidate().matrix);
        this.updateTransform();
        this.transform.pos = pos;
    }

    scaleTo(scaleDelta, anchorX, anchorY){
        
        
      
        this.matrixTransform(this.dragEndPos.x, this.dragEndPos.y, scaleDelta.x, scaleDelta.y, anchorX, anchorY);
        this.scaleDelta = scaleDelta;
        this.transformAnchor = {x: anchorX, y: anchorY};
    }


    updateTransform(){
        
        this.group.transform.baseVal.consolidate().setMatrix(this.matrix)
        
    }


    debugRect(x, y, w, h, color){
        let debug = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        debug.setAttribute("x", x);
        debug.setAttribute("y", y);
        debug.setAttribute("width", w);
        debug.setAttribute("height", h);
        debug.style.stroke = color;
        debug.style.fill = "transparent";
        this.parent.appendChild(debug);
    }

    selectedMouseMove(e){

        if(this.isDragging){
     
            let clickPos = new Vector2(e.layerX, e.layerY);
            
           // console.log(this.clickOffset);

            clickPos = clickPos.subtract(this.clickOffset);

            
            this.moveTo(clickPos);

        }
    }

    
    selectedMouseDown(e){
        e.stopPropagation();


        var rect = e.currentTarget.getBoundingClientRect();

        //add 5 to account for larger bounding box due to anchors.  It is halfed because they are half out
        let offsetX = e.offsetX - rect.left;
        let offsetY = e.offsetY - rect.top + 5;

        this.clickOffset = new Vector2(offsetX, offsetY);
        


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
       

        
       /*
        Action.commit(this.reliable, {
            action: "Drag",
            id: this.id,
            endPos: this.dragEndPos.toJSON(),
            startPos: this.dragStartPos.toJSON(),

           
            
        });  */
        this.dragStartPos = null;
        
    }


    getSelectionBounds(margin, scale){
        let bounds = this.svg.getBoundingClientRect();
   

        /*
        let left = bounds.left ;
        let top = bounds.top;
        let right = (left + bounds.width) * this.scaleDelta.x;
        let bottom = (top + bounds.height) * this.scaleDelta.y;

        left = Math.min(left, right);
        right = Math.max(left, right);
        top = Math.min(top, bottom);
        bottom = Math.max(top, bottom);*/
        let x = (bounds.x - this.matrix.e )/scale.x;
        let y = (bounds.y - this.matrix.f )/scale.y;
        let width = bounds.width  / scale.x;
        let height = bounds.height / scale.y;

        let left = Math.min(x, (x + width) ) 
        let right = Math.max(x, (x + width))
        let top = Math.min(y, (y + height))
        let bottom = Math.max(y, (y + height))

        left -= margin;
        right += margin;

        top -= margin;
        bottom += margin;

        width = right - left;
        height = bottom - top;

        return {left, right, top,  bottom, width, height};
    }

    createSelectRect(){
        let bounds = this.getSelectionBounds(10, this.scaleDelta);
  
        let selectRect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        let selectRectGroup = document.createElementNS("http://www.w3.org/2000/svg", 'g');


       
        let margin = 10;

        /*
        let rectX = bounds.x - this.transPos.x - (margin * this.scaleDelta.x);
        let rectY = bounds.y - this.transPos.y - (margin * this.scaleDelta.y)
        selectRect.setAttribute('x', rectX);
        selectRect.setAttribute('y', rectY);
        //selectRect.setAttribute("transform", `translate(${bounds.x - margin}, ${bounds.y - margin})`)

        let rectWidth = (bounds.width/this.scaleDelta.x) + (margin *2);
        let rectHeight = (bounds.height/this.scaleDelta.y) + (margin *2);
        selectRect.setAttribute('width', rectWidth);
        selectRect.setAttribute('height', rectHeight);*/

        selectRect.setAttribute('x', bounds.left);
        selectRect.setAttribute('y', bounds.top);
        selectRect.setAttribute('width', bounds.width);
        selectRect.setAttribute('height', bounds.height);

        selectRect.setAttribute("vector-effect","non-scaling-stroke");
        selectRect.style.stroke = "green";
        selectRect.style.fill = "transparent";

        

        selectRect.addEventListener('mousedown', (e) => this.selectedMouseDown(e));
        
        
      
        //this.debugRect(bounds.left, bounds.top, 10, 10, "purple");
        //this.debugRect(bounds.left, bounds.bottom, 10, 10, "purple");
        let anchorSize = 10;
        let topRightScaleAnchor = this.createDragRect(bounds.right, bounds.top, new Vector2(1, -1), "left", "bottom" );
        let bottomRightScaleAnchor = this.createDragRect(bounds.right, bounds.bottom, new Vector2(1, 1), "left", "top" );


        selectRectGroup.appendChild(selectRect);

        
        selectRectGroup.appendChild(topRightScaleAnchor);
        selectRectGroup.appendChild(bottomRightScaleAnchor);

        
        this.group.appendChild(selectRectGroup);

        let rect = this.group.getBoundingClientRect();
        //console.log(rect);
        return selectRectGroup;
    }

    createDragRect(x, y, anchor, anchorX, anchorY){

        let dragBoxSize = 10;

        x -= (dragBoxSize/2);
        y -= (dragBoxSize/2);
        let margin = 10;
        let bounds = this.group.getBoundingClientRect();
        let rightDrag = document.createElementNS("http://www.w3.org/2000/svg", 'rect');

        let rectWidth = (bounds.width/this.scaleDelta.x) + (margin *2);
        let rectHeight = (bounds.height/this.scaleDelta.y) + (margin *2);

       
        rightDrag.setAttribute('x', x);
        rightDrag.setAttribute('y', y);
        rightDrag.setAttribute('width', dragBoxSize);
        rightDrag.setAttribute('draggable', true);
        rightDrag.setAttribute('height', dragBoxSize);
        rightDrag.setAttribute("vector-effect","non-scaling-stroke");
        rightDrag.style.stroke = "red";
        rightDrag.style.fill = "transparent";
        

        

        rightDrag.addEventListener('mousedown', (mouseDown) => {

            mouseDown.stopPropagation();
            mouseDown.preventDefault();
            //change the anchor
            this.scaleAnchor = anchor;
            //this.matrixTransform(this.dragEndPos.x, this.dragEndPos.y, this.scaleDelta.x, this.scaleDelta.y, anchor.data[0], anchor.data[1]);
           // this.moveTo(this.transPos);

            //this.scaleTo(this.scaleDelta, anchorX, anchorY);

            let mouseStart = new Vector2(mouseDown.clientX, mouseDown.clientY);
           
          
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
     
    
            let moveEvent = (mouseMove) => {
                //this.group.transform =Z 
                if(this.stop == true)return;
                this.scaleAnchor = anchor;

                let mouseEnd = new Vector2(mouseMove.clientX, mouseMove.clientY);
                
                let delta = mouseEnd.subtract(mouseStart);
                
                //multiply startScale by normalized directional vector to move anchor
                
                let deltaPercent = new Vector2(this.scaleAnchor.x * (delta.x/rectWidth), this.scaleAnchor.y * (delta.y/rectHeight)).add(startScale);
               
                
                this.scaleTo(deltaPercent, anchorX, anchorY);
             

            };

            let upEvent = (mouseUp) => {
          
                document.removeEventListener('mousemove', moveRef);
                document.removeEventListener('mouseup', upRef);
/*
                Action.commit(this.reliable, {
                    action: "Scale",
                    id: this.id,
                    endScale: this.scaleDelta.toJSON(),
                    startScale: startScale.toJSON(),
                });   */
            };

  

        });
        return rightDrag;
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