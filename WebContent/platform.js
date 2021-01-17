class Platform{

    static postMessage(message){
        if(isVsCode){
            vscode.postMessage(message);
        }else{
    
        }
    }


}