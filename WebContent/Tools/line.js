
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

    canvasDragStart(pos){
        if(this.svgPath==null){
            this.svgPath = new SVGPath(this.reliable.canvas, pos);
            $(document).on("keypress", (e)=>{
               if(e.key=="Enter"){
                  
                    this.rig();
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



Line.keys = []
Line.frame = []
