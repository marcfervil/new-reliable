
class Action {

    constructor(data){
        this.data = data;

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
        let actionList = {Draw, Undo, Replace, DeleteSVGPath};
        let action = new actionList[actionData.action](actionData);

        //Undo should never be recorded
 
        if(actionData.action != "Undo"){
            reliable.actions.push(action);
            if(action.myAction) reliable.myActionIds.push(action.data.actionId);
        }

        action.execute(reliable);

        if(broadcast)action.broadcast();
        return action; 
        
    }

}





class Undo extends Action{
    
    constructor(data){
        super(data);
    }

    execute(reliable){

        let undo = reliable.actions.filter(action => action.data.actionId == this.data.undoActionId);
        
    
        if(undo.length > 0) {
            undo[0].undo();
            reliable.redoActions.push(undo[0]);
            reliable.actions.splice(reliable.actions.indexOf(undo[0]), 1);
        }else {
            console.log("Undo Desync!!!!!");
        }
        
    }

}

