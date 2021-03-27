
class Platform{

    static postMessage(message){
        if(isVsCode){
            vscode.postMessage(message);
        }else{
            if(message.action == "Refresh"){
                window.location = "/";
                return; 
            }
            Platform.socket.emit('data', message);
        }
    }

    static makeId(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
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
            settings.displayName = "User-"+Platform.makeId(5);
        }else{

            //recieve message from VSCode
           // if(settings.displayName.includes(" ")) settings.displayName = settings.split(" ")[0];
            window.addEventListener('message', (message) => {
                app.commit(message.data, false);
            });
        }
    }

}



//console.log("???");