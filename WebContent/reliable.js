

class Reliable {

    constructor(canvas, path, tools){
        this.toolbar = [];
        this.currentTool = 0;
        this.canvas = canvas;
        this.actions = [];
        this.myActionIds = [];
        this.redoActions = [];
        this.svgs = [];
        this.path = path;
        //this.canvas.addEventListener("mousedown", (e) => this.mouseDownCanvas(e));

        if(!isTouchDevice()){
            $(this.canvas).on("pointerdown", (e) => this.mouseDownCanvas(e))
        }else{
            $(this.canvas).on("touchstart", (e) => this.mouseDownCanvas(e))
        }
       


        this.toolbarDiv = $("#toolbar");
        for(let tool of tools)this.addTool(tool);
        //console.log(path);
        this.swapTool(tools[0]);
        
    }
    

    /**
    * @returns {Tool}
    */
    getCurrentTool(){
        if(this.currentTool!=-69){
            return this.toolbar[this.currentTool];
        }else{
            return new Tool();
        }
        
    }

    swapTool(tool, deactivate){
        let lastTool = this.getCurrentTool();
        if(deactivate === undefined || deactivate==true){
            lastTool.active = false;
            lastTool.dectivated();
        }
        lastTool.imgDiv.removeClass("selected");
        lastTool.imgDiv.addClass("unselected");
        //lastTool.imgDiv.removeClass("hover");
        this.currentTool = this.toolbar.indexOf(tool);
        tool.activated();
        tool.active = true;
        if(tool.imgDiv!==undefined){
            tool.imgDiv.addClass("selected");
            tool.imgDiv.removeClass("unselected");
        }
    }

  
    addTool(tool){
        
        this.toolbar.push(tool);
        tool.reliable = this;

        if(tool.getImage()!=""){
            let img = $("<img/>").attr("src", `${this.path}/images/icons/${tool.getImage()}`);
            let imgDiv = $("<div/>").attr("class", "iconDiv unselected").on("click", () => this.swapTool(tool));
            /*
            $.get(`${this.path}/images/icons/${tool.getImage()}`, (data)=>{
                let svgStr = new XMLSerializer().serializeToString(data.documentElement);
                let i = $($.parseHTML(svgStr));
                i[0].setAttribute("width",70);
                i[0].setAttribute("height",70);
                imgDiv.append(i);
              
               //rimgDiv.append(data);
            });*/
            imgDiv.append(img);
            //console.log(img[0].im)
           
            tool.imgDiv = imgDiv;
            
            this.toolbarDiv.append(imgDiv);
        }
    }


    clear(){
        
        for(let svg of this.svgs){
            svg.delete();

        }
        this.svgs = [];
    }

    test(){
        let state = this.getState();
        this.clear();
        console.log("restoring from serialized state...");
        setTimeout(() => {
            
            this.setState(state);
        }, 1000);
    }

    getState(){
        let state = [];
        for(let svg of this.svgs){
            state.push(svg.serialize())
        }
        return state;
    }

   

    setState(state){
        let svgs = {SVGPath, SVGImage, SVGText};
        for(let svgData of state){
            let args = [this.canvas, new Vector2(svgData.pos.x, svgData.pos.y), svgData.id];
            for (var key of Object.keys(svgData.args)) {
                args.push(svgData.args[key]);
            }
            let svg = new svgs[svgData.name](...args);
            svg.transform.scale = svgData.scale;
            let matrix = svgData.transform;
            svg.matrix.a = matrix.a;
            svg.matrix.b = matrix.b;
            svg.matrix.c = matrix.c;
            svg.matrix.d = matrix.d;
            svg.matrix.e = matrix.e;
            svg.matrix.f = matrix.f;

            svg.updateTransform();

            this.svgs.push(svg);
        }
    }
    
    commit(action, broadcast){
        Action.commit(this, action, broadcast);
    }


    undo(){
        if(this.myActionIds.length > 0){
            this.commit({
                action: "Undo",
                undoActionId: this.myActionIds.pop()
            });
        }
    }

  
    redo(){
        if(this.redoActions.length > 0){
            this.commit({
                action: "Redo",
            }, false);
        }
    }

    removeSVG(svg){
        this.svgs.splice(this.svgs.indexOf(svg), 1);
    }
    
    addSVG(svg){
        this.svgs.push(svg);
    }

    getMousPos(e){
        
        var pt = canvas.createSVGPoint();
       

        if(!isTouchDevice()){
            pt.x = e.clientX; 
            pt.y = e.clientY;
        }else{
            pt.x = e.touches[0].clientX; 
            pt.y = e.touches[0].clientY;
        }

        pt.matrixTransform(canvas.getScreenCTM().inverse())
       
        //return new Vector2(e.layerX, e.layerY).multiply(zoom);
        return new Vector2(pt.x, pt.y).multiply(zoom).add(pan);
    }

    mouseDownCanvas(e){
      
        if(this.getCurrentTool().eatCanvasDrag() && e.target.id!="backdrop") return;


        let mousePos = this.getMousPos(e);
        this.canvasMouseDown = true;
        this.canvasDragMouseStart = mousePos;
        
        this.mouseMoveRef = (e) => this.mouseMoveCanvas(e);
        this.mouseUpRef = (e) => this.mouseUpCanvas(e);
       
        if(!isTouchDevice()){
            this.canvas.addEventListener('pointermove', this.mouseMoveRef);
            this.canvas.addEventListener('pointerup', this.mouseUpRef);

            
            $(this.canvas).on("pointerleave.canvas", this.mouseUpRef);
        }else{
            this.canvas.addEventListener('touchmove', this.mouseMoveRef);
            this.canvas.addEventListener('touchend', this.mouseUpRef);

            //this.mouseUpRef
            $(document).on("touchend.canvas", this.mouseUpRef);
        }

        this.getCurrentTool().canvasDragStart(mousePos);
    }

    mouseMoveCanvas(e){
        
        let pos = this.getMousPos(e);
        //console.log(pos);
        this.getCurrentTool().canvasDrag(pos);
    }

    mouseUpCanvas(e){
        this.canvasMouseDown = false;
        this.canvas.removeEventListener('pointermove', this.mouseMoveRef);
        this.canvas.removeEventListener('pointerup', this.mouseUpRef);
        this.canvas.removeEventListener('touchmove', this.mouseMoveRef);
        this.canvas.removeEventListener('touchend', this.mouseUpRef);
        $(this.canvas).off("pointerleave.canvas");
        $(document).off("touchend.canvas");
        this.getCurrentTool().canvasDragEnd();
    }

    static makeId(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

}
