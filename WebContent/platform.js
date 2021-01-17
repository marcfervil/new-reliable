class Platform{

    static postMessage(message){
        if(isVsCode){
            vscode.postMessage(message);
        }else{
    
        }
    }

    static init(){
        if(!isVsCode){
            var socket = io();
        }
    }

}



//console.log("???");