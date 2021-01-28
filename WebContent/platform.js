
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
            window.addEventListener("beforeunload", function(e){
                Platform.socket.disconnect();
             }, false);

            Platform.socket.on('data', (message) => {
          
                app.commit(message, false);
            });
            settings.displayName = Math.random();
        }else{

            //recieve message from VSCode
            if(settings.displayName.includes(" ")) settings.displayName = settings.split(" ")[0];
            window.addEventListener('message', (message) => {
                app.commit(message.data, false);
            });
        }
    }

}



//console.log("???");