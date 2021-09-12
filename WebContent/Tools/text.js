

class TextTool extends Tool{

    constructor(){
        super("Text");
        this.doubleClickCount = 0;
        this.typing = false;
        canvas.addEventListener("mousedown", (e) => this.doubleClick(e));
    }

    doubleClick(e){
        if(this.doubleClick == 2) return;
        this.doubleClickCount += 1;
     

        this.timeout = setTimeout(() => {
            this.doubleClickCount -= 1;
            if(this.doubleClickCount==1){
                this.doubleClickCount = 0;
                clearTimeout(this.timeout);
                if(!this.active)this.reliable.swapTool(this);
                this.creatTextInput(this.reliable, getMousePos());
                
            }
        }, 200);
        
    }    

    canvasDragStart(pos){
       if(this.typing)this.currentInput.commit();
       else if(this.active) this.creatTextInput(this.reliable, getMousePos());
    
    }

    eatCanvasDrag(){
        return true;
    }

    creatTextInput(reliable, pos){
        if(this.typing)return;
        this.typing = true;
        this.currentInput = new TextInput(reliable, pos, (text) => {
            this.typing = false;
            if(text.trim().length>0){
                reliable.commit({
                    action: "Text",
                    pos: pos.toJSON(),
                    text: text,
                    id: Reliable.makeId(10),
                });
            }
        });
    }

    getImage(){
        return "text2.svg";
    }

}

class TextInput{

    constructor(reliable, pos, textEntered){
        this.reliable = reliable;
        this.pos = pos;
        this.makeInput();
        this.textEntered = textEntered;
    }

    makeInput(){
        hotkeysEnabled = false;
        let objSVG = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
        objSVG.setAttribute("x", this.pos.x);
        objSVG.setAttribute("y", this.pos.y);
        objSVG.setAttribute("width", "10000px");
        objSVG.setAttribute("height", "50px");
        objSVG.style.zIndex = "100";
        objSVG.style.overflow="hidden";

        let objDiv = document.createElement('div');
        
        

        this.textInput = $("<input/>").attr("type", "text").attr("class", "SVGInput");
        $(objDiv).append(this.textInput);
        this.textInput.on("keypress", (e) => {
            e.stopPropagation();
            if(e.key=="Enter")this.commit();
        });
       
        this.textInput.on("click", (e) => {
            e.stopPropagation();
            
        });
        setTimeout(()=>{
            this.textInput.focus();
            window.scrollTo(0, 0);
        },0);

        objSVG.appendChild(objDiv);
 
        this.reliable.canvas.appendChild(objSVG);
        this.objSVG = objSVG;
    }   

    

    commit(){
        this.textEntered(this.textInput.val());
        this.objSVG.remove();
        hotkeysEnabled = true;
    }

}