

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
        $(this.canvas).on("mousedown", (e) => this.mouseDownCanvas(e))
        this.toolbarDiv = $("#toolbar");
        for(let tool of tools)this.addTool(tool);
        //console.log(path);
        this.swapTool(tools[0]);
        //remove later
        
        console.log("svg added")
        let tempSvg = new SVGPath(this.canvas,new Vector2(0,0));
        tempSvg.replacePath("M 3151.8 2858.6 C 3117.9 2864.8 3052.1 2919.0 3049.5 2940.5 3045.8 2975.9 3066.8 3018.7 3079.6 3025.0 3160.5 3073.7 3280.9 3192.3 3293.5 3233.6 3306.3 3286.3 3287.7 3373.6 3275.8 3391.3 3230.2 3449.7 3083.4 3509.8 3052.1 3493.5 2952.8 3434.0 2895.4 3342.3 2863.2 3170.9")
        Action.commit(this, {
            action: "Draw",
            id: tempSvg.id,
            path: tempSvg.pathData,
            color: "#AAB2C0",
            pos: {
                x: 3151.8,
                y: 2858.6,
            }
        })
        tempSvg.delete()
        
        
    }
    

    /**
    * @returns {Tool}
    */
    getCurrentTool(){
        return this.toolbar[this.currentTool];
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
        tool.imgDiv.addClass("selected");
        tool.imgDiv.removeClass("unselected");
    }

    addTool(tool){
        
        this.toolbar.push(tool);
        tool.reliable = this;

        if(tool.getImage()!=""){
            
            //console.log(`${this.path}images/icons/${tool.getImage()}`);
            
            let img = $("<img/>").attr("src", `${this.path}/images/icons/${tool.getImage()}`);
            let imgDiv = $("<div/>").attr("class", "iconDiv unselected").append(img).on("click", () => this.swapTool(tool));
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
        pt.x = e.clientX; 
        pt.y = e.clientY;
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
       
        this.canvas.addEventListener('mousemove', this.mouseMoveRef);
        this.canvas.addEventListener('mouseup', this.mouseUpRef);
        $(this.canvas).on("mouseleave.canvas", this.mouseUpRef);

        this.getCurrentTool().canvasDragStart(mousePos);
    }

    mouseMoveCanvas(e){
        let pos = this.getMousPos(e);
        this.getCurrentTool().canvasDrag(pos);
    }

    mouseUpCanvas(e){
        
        this.canvasMouseDown = false;
        this.canvas.removeEventListener('mousemove', this.mouseMoveRef);
        this.canvas.removeEventListener('mouseup', this.mouseUpRef);
        $(this.canvas).off("mouseleave.canvas");
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
