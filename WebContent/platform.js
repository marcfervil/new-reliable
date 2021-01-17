class Platform{

    static postMessage(message){
        if(isVsCode){
            vscode.postMessage(message);
        }else{
           
            Platform.socket.emit('data', message);
        }
    }

    static init(){
        if(!isVsCode){
            let slug = window.location.pathname;
            Platform.socket = io();
            Platform.socket.on('data', (message) => {
          
                app.commit(message, false);
            });
        }else{

            //recieve message from VSCode
            window.addEventListener('message', (message) => {
                app.commit(message.data, false);
            });
        }
    }

}



//console.log("???");