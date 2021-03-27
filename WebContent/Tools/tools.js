

//The tool class represents any tool in the toolbar.  EX: Pen tool, pan tool, etc.
class Tool {


   
    constructor(name){
        
        this.name = name;
        this.canvas = undefined;
        this.active = false;
    }

    //TODO: remember what this is for.  All I know is that it's niche
    eatCanvasDrag(){
        return false;
    }

    //is fired when the canvas is clicked 
    canvasDragStart(){

    }
    
    //activates while mouse is pressed down on canvas and moving
    canvasDrag(){

    }
    //when you stop pressing down on the mouse
    canvasDragEnd(){

    }
    
    //this is the url of the image that will be displayed in the toolbar
    getImage()
    {
        return "";
    }

    //?????
    activated(){
        
    }

    dectivated(){
        
    }

    
}




