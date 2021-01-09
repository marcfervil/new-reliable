

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
    

    mouseDownCanvas(e){
        
        let mousePos = new Vector2(e.layerX, e.layerY);
        this.canvasMouseDown = true;
        this.canvasDragMouseStart = mousePos;
        
        this.mouseMoveRef = (e) => this.mouseMoveCanvas(e);
        this.mouseUpRef = (e) => this.mouseUpCanvas(e);
       
        this.canvas.addEventListener('mousemove', this.mouseMoveRef);
        this.canvas.addEventLisptener('mouseup', this.mouseUpRef);
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
