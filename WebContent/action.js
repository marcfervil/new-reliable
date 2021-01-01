class Action {

    constructor(data){
        this.data = data;
    }


    execute(reliable){
        
    }

    undo(){

    }
    
    broadcast(){
        vscode.postMessage(this.data);
    }

    static commit(reliable, actionData, broadcast){
        let actionList = {Draw};
        let action = new actionList[actionData.action](actionData);
        reliable.actions.push(action);
        action.execute(reliable);
        if(broadcast)action.broadcast();
        return action; 
        
    }



}



class Draw extends Action{

    constructor(data){
        super(data);
    }

    execute(reliable){
        this.svgPath = new SVGPath(reliable.canvas, new Vector2());
        this.svgPath.replacePath(this.data.path);
    }

    undo(){

    }

}

