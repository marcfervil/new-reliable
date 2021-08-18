
class Line extends Tool{

    constructor(){
        super("line");
    }

    getImage(){
        return "draw2.svg";
    }

    rig(){
        this.svgPath.createPointHandles();
        let svgRect = this.reliable.canvas.createSVGRect();

        this.svgPath.isBonerig=true;
        let rect = this.svgPath.svg.getBoundingClientRectOld();
        svgRect.x = (rect.x);
        svgRect.y = (rect.y);
        svgRect.width = rect.width ;
        svgRect.height = rect.height ;   

        let hits = Array.from(this.reliable.canvas.getIntersectionList(svgRect, null));
  

       
        //console.log(hits.forEach((item)=>console.log(item.svg)))
        let riggedSvg = hits.find((svg)=>svg.reliableSvg?.smoothed==true);
       
        this.svgPath.bones = riggedSvg.reliableSvg;

        riggedSvg.style.stroke = "black";
        riggedSvg.style.fill = "green";
        riggedSvg.style.strokeWidth = 4;
        //this.svgPath = null;
        //     console.log(riggedSvg.reliableSvg.things)
      //  riggedSvg.reliableSvg.things.forEach((thing)=>{if(thing!=null)thing.style.opacity=0});
        riggedSvg.reliableSvg.isRigged = true;

        //onsole.log("rigged",riggedSvg.svg)
        //console.log(riggedSvg.reliableSvg);
    }

    setFrame(num){
        console.log("playing frame with ",  Object.entries(Line.keys[num]).length, "keys")
        for(let keyId in Line.keys[num]){
            console.log(keyId)
            Line.keys[num][keyId].frame();
            Line.keys[num][keyId].frame();
           // Line.keys[0][keyId].update.updateRig(Line.keys[0][keyId].pos)
        }
    }

    play(){
        Line.frameNum = 0
        this.setFrame( Line.frameNum);
        setInterval(() => {
            this.setFrame( Line.frameNum);
            Line.frameNum +=1; 
        }, 1000);
    }

    canvasDragStart(pos){
        if(this.svgPath==null){
            this.svgPath = new SVGPath(this.reliable.canvas, pos);
            $(document).on("keypress", (e)=>{
               if(e.key=="Enter"){
                  
                    this.rig();
                    app.toggleTools();
               }
               if(e.key=="k"){
                   //let x = Line.frame;
                   let frame = Object.assign({}, Line.frame);
                   console.log(Object.entries(frame).length)
                   Line.keys.push(frame)

                   Line.frame = {};
               }
               //console.log(e.key)
               if(e.key==" "){
                    console.log(Line.keys[0])
                   //this.play();
                   this.setFrame(0)
               }    
            })
        }else{
            this.svgPath.addPoint(new Vector2(pos.x, pos.y));
            //this.svgPath.svg.style.stroke = "purple"
        }
        
    }

 
    canvasDragEnd(){
     
    }
}


Line.frameNum = 0;
Line.keys = []
Line.frame = {}
