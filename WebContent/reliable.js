

class Reliable {

    constructor(canvas, tools){
        this.toolbar = [];
        this.currentTool = 0;
        this.canvas = canvas;
        this.actions = [];
        this.myActionIds = [];
        this.redoActions = [];
        this.svgs = [];
        this.canvas.addEventListener("mousedown", (e) => this.mouseDownCanvas(e));
        
        for(let tool of tools)this.addTool(tool);
        
    }
    

    /**
    * @returns {Tool}
    */
    getCurrentTool(){
        return this.toolbar[this.currentTool];
    }

    addTool(tool){
       
        this.toolbar.push(tool);
        tool.reliable = this;
    }

    test(){
        
        let state = this.getState();
        for(let svg of this.svgs){
            svg.delete();

        }
        this.svgs = [];
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
        let svgs = {SVGPath, SVGImage};
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
    

    mouseDownCanvas(e){
        
        let mousePos = new Vector2(e.layerX, e.layerY);
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
        let pos = new Vector2(e.layerX, e.layerY);
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
