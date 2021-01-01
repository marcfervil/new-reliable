class Action {

    constructor(data){
        this.data = data;
    }


    execute(reliable){
        
    }

    undo(){

    }
    
    broadcast(){
        console.log("broadcast");
        console.log(this.data);
        vscode.postMessage(this.data);
    }

    static commit(reliable, actionData){
        let actionList = {Draw};
        console.log("WE BOUT THAT "+actionData.action);
        let action = new actionList[actionData.action](actionData);
        reliable.actions.push(action);
        action.execute(reliable);
        action.broadcast();
        return action; 
    }



}



class Draw extends Action{

    constructor(data){
        super(data);
    }

    /*
        {
            action: "Draw",
            data: {
                id: "fowkfew"
            }
        }
    */

    execute(reliable){
        this.svgPath = new SVGPath(reliable.canvas, new Vector2());
        this.svgPath.replacePath(this.data.data.path);
    }

    undo(){

    }

}

