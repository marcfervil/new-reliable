

class Reliable {

    constructor(canvas){
        this.toolbar = [];
        this.currentTool = 0;
        this.canvas = canvas;
        this.actions = [];
        this.svgs = [];
        this.canvas.addEventListener("mousedown", (e) => this.mouseDownCanvas(e));

        this.network();
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
    
    network(){
        window.addEventListener('message', (actionData) => {
            console.log("WWE RAW DATA");
            console.log(actionData);
            Action.commit(this, actionData.data);
        });
    }

    mouseDownCanvas(e){
        
        let mousePos = new Vector2(e.layerX, e.layerY);
        this.canvasMouseDown = true;
        this.canvasDragMouseStart = mousePos;
        
        this.mouseMoveRef = (e) => this.mouseMoveCanvas(e);
        this.mouseUpRef = (e) => this.mouseUpCanvas(e);

        this.canvas.addEventListener('mousemove', this.mouseMoveRef);
        this.canvas.addEventListener('mouseup', this.mouseUpRef);
        this.getCurrentTool().canvasDragStart(mousePos);
    }

    mouseMoveCanvas(e){
        //if(element.mouseDown==1){
        let pos = new Vector2(e.layerX, e.layerY);
        this.getCurrentTool().canvasDrag(pos);
    }

    mouseUpCanvas(e){
        this.canvasMouseDown = false;
        this.canvas.removeEventListener('mousemove', this.mouseMoveRef);
        this.canvas.removeEventListener('mouseup', this.mouseUpRef);
        this.getCurrentTool().canvasDragEnd();
    }

}
