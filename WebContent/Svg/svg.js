


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

        this.group.setAttribute("transform", `translate(0, 0)`);
        this.matrix = this.group.transform.baseVal.consolidate().matrix;

        this.scaleDelta = new Vector2(1, 1);

        this.scaleAnchor= new Vector2(1, -1);
        this.transformAnchor = {x: "left", y:"top"};

        this.totalScale = new Vector2(1, 1);
        //console.log(this.matrix);
        //TODO: FIX RACE CONDITION
        //Is it a really a race condition if the timeout is 0?
        //setTimeout(() => {
            
            this.canvasRect = this.group.getBoundingClientRect();


    
            this.canvasPos = new Vector2(this.canvasRect.x, this.canvasRect.y).subtract(new Vector2(10, 10));
            this.dragEndPos = this.canvasPos;
            
            this.transform = {
                startPos : new Vector2(this.canvasRect.x, this.canvasRect.y),
                pos:   new Vector2(this.canvasRect.x, this.canvasRect.y),
                translatedPos: new Vector2(0, 0),
                startMatrix: this.group.transform.baseVal.consolidate().matrix,
                scale: new Vector2(1, 1),
                anchorX: "left",
                anchorY: "top",

            }
          
            

     //   }, 0)
     
        this.updateAnchor = false; 
       // this.testScale= new Vector2(2, 2);

        this.dragStartPos = null;

        
        this.transPos = new Vector2(0, 0);


        this.fix = false;
        

        
    }

    setContent(){

    }

    getSelectMargin(){
        return 10;
    }
    
    moveTo(pos){
        
        //our desired location is going to be the distance between our current position (pos), and our orgin (startPos)
        let selectMargin = new Vector2(5+this.getSelectMargin(), 5+this.getSelectMargin());
        if(this.isSelected)pos = pos.subtract(selectMargin);
        let newPos = pos.subtract(this.transform.startPos);
       

        //manually set x and y (e and f in the transform matrix) to be our desired location and update the transformation matrix
        this.matrix.e = newPos.x;
        this.matrix.f = newPos.y;
        this.updateTransform();
        
        //get the actual position of our svg 
        let svgBounds = this.group.getBoundingClientRect();
        let svgPos = new Vector2(svgBounds.x, svgBounds.y);

        /*
        offset the position of the svg by the distance between our desired position and our actual position, then update the transformation matrix.
        This is done because we always want the svg to be moved by the top left coordinate (the orgin), and when we scale an svg by a different anchor/orgin
        our svg's actual position has been augmented and we need the position that we're dragging it to to reflect that
        */
        let dist = pos.subtract(svgPos).divide(this.transform.scale);
        this.matrix = this.matrix.translate(dist.x, dist.y);
        this.updateTransform();

        //update the position of our svg
        if(this.isSelected)pos = pos.add(selectMargin);
        this.transform.pos = pos;
        this.pos = pos;
    }


    scaleTo(scale, anchorX, anchorY){
        
       //if not selected, create fake selection box so un/redos still work 
        let fakeSelect = this.isSelected;
        if(!fakeSelect)this.select();

         //prevent scaling from making width & height < 30 because I don't want to deal with that
         if((this.selectBounds.width ) * scale.x < 30)scale.x = 30/this.selectBounds.width;
         if((this.selectBounds.height ) * scale.y < 30)scale.y = 30/this.selectBounds.height;

        //returns position of svg relative to the anchor [top left, bottom right, etc]
        let getPos = () => {
            let bounds = this.selectRect.getBoundingClientRect();
            return new Vector2(bounds[anchorX], bounds[anchorY]);
        }

        //get starting position relative to scale anchor
        let pos = getPos();
        //if(!this.isSelected)pos = pos.subtract(new Vector2(10, 10));

        //redraw scale anchors and pass in our desired scale to undo the scaling caused by the group's scale, because scaling the group svg also scales the anchors
        if(this.isSelected)this.redrawAnchors(scale);
      
        //scale it back down to the og size so that we set the absolute size, not the relative size
        let oneScalar = new Vector2(1, 1).divide(this.transform.scale);
        this.matrix = this.matrix.scaleNonUniform(oneScalar.x, oneScalar.y);

        //scale it to desired size and update the transformation matrix
        this.matrix = this.matrix.scaleNonUniform(scale.x, scale.y);
        this.updateTransform();
 
        //the amount to offset the svg so it scales relative to the anchor is the difference between the orgin pre-scale and post-scale [the orgin being the anchor]
        let transPos = pos.subtract(getPos()).divide(scale);
        

        //translate the matrix by our offset and update the transformation matrix
        this.matrix = this.matrix.translate(transPos.x, transPos.y);
        this.updateTransform();
     
        //update the scale of our svg
        this.transform.scale = scale;
        if(!fakeSelect)this.unselect();
    }

    rotateTo(){
        this.svg.setAttribute("transform", `translate(${this.transform.pos.x}, ${this.transform.pos.y}) rotate(90) translate(-${this.transform.pos.x}, -${this.transform.pos.y}) `);
    }

    updateTransform(){
        
        this.group.transform.baseVal.consolidate().setMatrix(this.matrix)
        
    }


  
    selectedMouseMove(e){
       
        if(this.isDragging){
            //used to layerX, layerY...look into this..
            let clickPos = new Vector2(e.clientX, e.clientY).multiply(zoom);
       
            clickPos = clickPos.subtract(this.clickOffset);

            
            this.moveTo(clickPos);

        }
    }

    
    selectedMouseDown(e){
        e.stopPropagation();

       
        var rect = e.currentTarget.getBoundingClientRect();
       
        this.startDrag = this.transform.pos;

        //add 5 to account for larger bounding box due to anchors.  It is halfed because they are half out
        let offsetX = (e.offsetX*zoom.x) - rect.left - this.getSelectMargin();
        let offsetY = (e.offsetY*zoom.y) - rect.top - this.getSelectMargin();

        this.clickOffset = new Vector2(offsetX, offsetY);
       // console.log(this.clickOffset);


        this.mouseMoveRef = (e) => this.selectedMouseMove(e);
        this.mouseUpRef = (e) => this.selectedMouseUp(e);

       
        this.parent.addEventListener('mousemove', this.mouseMoveRef);
        this.parent.addEventListener('mouseup', this.mouseUpRef);

        this.isDragging = true; 

        
    }

   

    selectedMouseUp(e){

      
        this.parent.removeEventListener('mousemove', this.mouseMoveRef);
        this.parent.removeEventListener('mouseup', this.mouseUpRef);

        this.isDragging = false; 
    
        let endDrag = this.transform.pos;

        Action.commit(this.reliable, {
            action: "Drag",
            id: this.id,
            end: endDrag.toJSON(),
            start: this.startDrag.toJSON(),

        });  
        this.dragStartPos = null;
        
    }

    serialize(){
        let data = {
            "transform": this.serializeMatrix(),
            "name": this.constructor.name,
            "scale": this.transform.scale,
            "pos": this.pos,
            "id": this.id,
            "args": {}
        }
        for(let prop of this.getSerializableProperties()){
            data["args"][prop] = this[prop];
        }
        return data; 
    }

    serializeMatrix(){
        return {
            "a": this.matrix.a,
            "b": this.matrix.b,
            "c": this.matrix.c,
            "d": this.matrix.d,
            "e": this.matrix.e,
            "f": this.matrix.f,
        }
    }

    getSerializableProperties(){
        return [];
    }

    getSelectionBounds(margin, scale){
        let bounds = this.svg.getBoundingClientRect();
   

        if(scale==undefined) scale = this.transform.scale;
        let x = (bounds.x - this.matrix.e )/scale.x;
        let y = (bounds.y - this.matrix.f )/scale.y;
        let width = bounds.width / scale.x;
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
        this.anchors = []
        let bounds = this.getSelectionBounds(this.getSelectMargin());
  
        let selectRect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        let selectRectGroup = document.createElementNS("http://www.w3.org/2000/svg", 'g');

        let margin = 10;

        selectRect.setAttribute('x', bounds.left);
        selectRect.setAttribute('y', bounds.top);
        selectRect.setAttribute('width', bounds.width);
        selectRect.setAttribute('height', bounds.height);

        selectRect.setAttribute("vector-effect","non-scaling-stroke");
        selectRect.style.stroke = "green";
        selectRect.style.fill = "transparent";

        

        selectRect.addEventListener('mousedown', (e) => this.selectedMouseDown(e));
        
        selectRectGroup.appendChild(selectRect);
      
        let anchorSize = 10;
        let topRightScaleAnchor = this.createDragRect(selectRect, "right", "top", new Vector2(1, -1), "left", "bottom" );
        let bottomRightScaleAnchor = this.createDragRect(selectRect, "right", "bottom", new Vector2(1, 1), "left", "top" );
        let bottomLeftScaleAnchor = this.createDragRect(selectRect, "left", "bottom", new Vector2(-1, 1), "right", "top" );
        let topLeftScaleAnchor = this.createDragRect(selectRect, "left", "top", new Vector2(-1, -1), "right", "bottom" );


        this.anchors.push(bottomRightScaleAnchor);
        this.anchors.push(topRightScaleAnchor);
        this.anchors.push(bottomLeftScaleAnchor);
        this.anchors.push(topLeftScaleAnchor);

        for(let anchor of this.anchors){
            selectRectGroup.appendChild(anchor.svg);
        }
       
        this.group.appendChild(selectRectGroup);
        
        
        return selectRectGroup;
    }

    redrawAnchors(size){
        for(let anchor of this.anchors){
            anchor.setSize(size);
        }
    }

    createDragRect(selectRect, x, y, anchor, anchorX, anchorY){

        let dragBoxSize = 10;

   
        let margin = 10;
        //let bounds = selectRect.getBoundingClientRect();
        let rightDrag = document.createElementNS("http://www.w3.org/2000/svg", 'rect');

        let rectWidth = selectRect.getAttribute("width");
        let rectHeight = selectRect.getAttribute("height");
      
       
        
        rightDrag.setAttribute("vector-effect","non-scaling-stroke");
        rightDrag.style.stroke = "red";
        rightDrag.style.fill = "red";
        
      
        
        let setSize = (scale) => {

            let scaleX = Math.abs(scale.x);
            let scaleY = Math.abs(scale.y);
            if(scaleX==0) scaleX=1;
            if(scaleY==0) scaleY=1;
            
            let scaleWidth = 10/scaleX;
            let scaleHeight = 10/scaleY

           

            //getSe
            let bounds = this.getSelectionBounds(this.getSelectMargin());
    
            rightDrag.setAttribute('x', bounds[x] - (scaleWidth/2));
            rightDrag.setAttribute('y', bounds[y] - (scaleHeight/2));

            rightDrag.setAttribute('width', scaleWidth);
            rightDrag.setAttribute('height', scaleHeight);
            
        }

        setSize(this.transform.scale);

        rightDrag.addEventListener('mousedown', (mouseDown) => {

            mouseDown.stopPropagation();
            mouseDown.preventDefault();
            //change the anchor
            this.scaleAnchor = anchor;


            let mouseStart = new Vector2(mouseDown.clientX, mouseDown.clientY).multiply(zoom);
           
          
   
            
            let moveRef = (e) => {moveEvent(e)};
            let upRef = (e) => {upEvent(e)}
            document.addEventListener('mousemove', moveRef);
            document.addEventListener('mouseup', upRef);

            
            let startScale = this.transform.scale.clone();
     
            this.scaleStart = this.transform.scale;

            let moveEvent = (mouseMove) => {

       
                this.scaleAnchor = anchor;

                let mouseEnd = new Vector2(mouseMove.clientX, mouseMove.clientY).multiply(zoom);
                let delta = mouseEnd.subtract(mouseStart);

                let deltaPercent = new Vector2(this.scaleAnchor.x * (delta.x/rectWidth), this.scaleAnchor.y * (delta.y/rectHeight)).add(startScale);
               
               
                this.scaleTo(deltaPercent, anchorX, anchorY);
            
                
            };

            let upEvent = (mouseUp) => {
          
                document.removeEventListener('mousemove', moveRef);
                document.removeEventListener('mouseup', upRef);

                Action.commit(this.reliable, {
                    action: "Scale",
                    id: this.id,
                    start: this.scaleStart,
                    end: this.transform.scale.toJSON(),
                    anchorX: anchorX,
                    anchorY: anchorY
                });   
            };

        });
        return {svg: rightDrag, setSize};
    }


    
    select(reliable, mySelection){
        this.reliable = reliable;
        if(this.isSelected) return;
        this.isSelected = true;
        this.selectRect = this.createSelectRect();
        
        if(this.selectBounds===undefined)this.selectBounds = this.selectRect.getBoundingClientRect();
        
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