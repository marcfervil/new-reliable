

class Text extends Tool{

    constructor(){
        super("Text");
        this.doubleClickCount = 0;
        canvas.addEventListener("mousedown", (e) => this.doubleClick(e));
    }

    doubleClick(e){
        if(this.doubleClick == 2 || this.active) return;
        this.doubleClickCount += 1;
     

        this.timeout = setTimeout(() => {
            this.doubleClickCount -= 1;
            if(this.doubleClickCount==1){
                this.doubleClickCount = 0;
                clearTimeout(this.timeout);
                this.creatTextInput(this.reliable, getMousePos());
                
            }
        }, 200);
        
    }    

    creatTextInput(reliable, pos){
        console.log(pos);
        console.log("Text created at "+pos);
        new TextInput(reliable, pos);
    }

    getImage(){
        return "image2.svg";
    }

}

class TextInput{

    constructor(reliable, pos){
        this.reliable = reliable;
        this.pos = pos;
        this.input = this.makeInput();
    }

    makeInput(){
        let objSVG = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
        objSVG.setAttribute("x", this.pos.x);
        objSVG.setAttribute("y", this.pos.y);
        objSVG.setAttribute("width", 200+"px");
        objSVG.setAttribute("height", 50+"px");

        
        objSVG.style.zIndex = 1000;
        let objDiv = document.createElement('div');
        //objDiv.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
        let text = document.createTextNode("yuh");
        objDiv.appendChild(text);
        objSVG.appendChild(objDiv);
 
        this.reliable.canvas.appendChild(objSVG);
    }   

}