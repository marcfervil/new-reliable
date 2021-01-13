
class Action {

    constructor(data){
        this.data = data;
        this.unDoable = true;
        if(this.data.actionId == undefined){
            this.data.actionId = Reliable.makeId(10);
            this.myAction = true;
        }else{
            this.myAction = false;
        }
    }


    execute(reliable){
       this.reliable = reliable;
    }

    undo(){

    }
    
    broadcast(){
        vscode.postMessage(this.data);
    }

    /**
     * @param {Reliable} reliable
     */
    static commit(reliable, actionData, broadcast){
        if(broadcast==undefined)broadcast = true; 

        let actionList = {Draw, Undo, Select, UnSelect, Drag, Delete, Scale, Replace, DeleteSVGPath, Image, Redo, State, Text};
        let action = new actionList[actionData.action](actionData);

  
        if(action.unDoable){
            reliable.actions.push(action);
            if(action.myAction) {
                if(action.data.fromRedo===undefined)reliable.redoActions = [];
                reliable.myActionIds.push(action.data.actionId);
            }
        }

        action.execute(reliable);

        if(broadcast)action.broadcast();

        vscode.postMessage({
            action: "State",
            data: reliable.getState()
        });

        return action; 
        
    }

}


class Redo extends Action{
    
    constructor(data){
        super(data);
        this.unDoable = false;
    }

    execute(reliable){
        
        if(reliable.redoActions.length > 0) {
            let redo = reliable.redoActions.pop();
            delete redo.data["actionId"];
            redo.data.fromRedo = true;
            reliable.commit(redo.data);
        }
    }

}



class Undo extends Action{
    
    constructor(data){
        super(data);
        this.unDoable = false;
    }

    execute(reliable){

        let undo = reliable.actions.filter(action => action.data.actionId == this.data.undoActionId);
        
    
        if(undo.length > 0) {
            undo[0].undo();
            if(this.myAction)reliable.redoActions.push(undo[0]);
            reliable.actions.splice(reliable.actions.indexOf(undo[0]), 1);
        }else {
            console.log("Undo Desync!!!!!");
        }
        
    }

}



class State extends Action{
    
    constructor(data){
        super(data);
    }

    execute(reliable){
        reliable.setState(this.data.state);
    }

}

