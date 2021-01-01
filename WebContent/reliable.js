class Reliable {

    constructor(canvas){
        this.toolbar = [];
        this.currentTool = 0;
        this.canvas = canvas;
    }

    getCurrentTool(){
        return this.toolbar[this.this.currentTool];
    }

    addTool(tool){
        tool.canvas = this.canvas;
        this.toolbar.push(tool);
    }

}