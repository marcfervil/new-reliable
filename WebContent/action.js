/*

    Every action that a user can take in the app can be described as an Action object
    For example, when the user draws a random line, a draw action is committed  (see the commit function for details on action committing)
    This system helps ensure that every action is self contained and is able to be executed and undone
    Every action object has three main attributes:
        execute()
        undo()
        data

    execute() is what gets called when an action is recived from the server, and that contains the primary functionality of the action
    undo() is what is called when a user undoes the action

    data is essentially the initial JSON object that is used to create the action, and has all of the relevant information that is requried to execute the action
    ex: If you're committing a select action the data json [might] look like:
    {
        action: "Select", //action is the name of the class that the action committal is going to create 
        ids: ["3Hf8H"] //ids is an array of the IDs of the selected SVGs 
    } 
    
    the process for committing a Selection Action may look like this:

    1). user selects SVGs on the app 
    2). the Selection tool creates a selection JSON ex: {action: "Select", ids: ["3Hf8H"]}
    3). That selection JSON is committed
    4). the commit function turns the action data JSON into a Selection action object 
        note: The "action" key in the action data JSON determines the Action class that it is converted to
    5). the selection action object is executed 
    6). the selection action is broadcasted (only if the action is committed with broadcast param set to true)
        note: the data param in the Action class is what's broadcasted to the other users and then subsequently committed
    
*/

class Action /*Lawsuit*/{

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
    
    //helper of commit function. Sends data to the other users.
    broadcast(){
        Platform.postMessage(this.data);
    }

    /**
     * Sends the action to the other users and adds the action to the undo/redo lists
     * Every action must be commited. Thems the rules.
     * 
     * @param {Reliable} reliable is a reference to the state of the app
     * @param {Object} actionData is action JSON that is passed in
     * @param {Boolean} broadcast is a bool that determines if the action is sent to the server for the other users to see 
     * @returns {action} Returns the created action
    */
    static commit(reliable, actionData, broadcast = true){
        

        // turn actionData JSON into corrosponding Action object. The "action" key in the data JSON determines the Action class that it is converted to.
        let actionList = {Draw, Undo, Select, UnSelect, Drag, Delete, Scale, Replace, DeleteSVGPath, Image, Redo, State, Text, MouseInput};
        let action = new actionList[actionData.action](actionData);

        //if the action is undoable, and I was the user that committed it, add it to the list of actions that I can undo
        if(action.unDoable){
            reliable.actions.push(action);
            if(action.myAction) {
                if(action.data.fromRedo===undefined)reliable.redoActions = [];
                reliable.myActionIds.push(action.data.actionId);
            }
        }
        

        if(actionData["broadcastSelf"]===false){
            delete actionData["broadcastSelf"];
        }else{
            action.execute(reliable);
        }
        
        if(broadcast)action.broadcast();

        Platform.postMessage({
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

