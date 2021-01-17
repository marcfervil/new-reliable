// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require("fs");
let vsls = require("vsls");
let path = require('path');
let handlebars = require("handlebars");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
} 

class ReliableTreeItem {
	

	constructor(){
		this.command = {
			command: "new-reliable.start",
			name:"Oh Boy"
		};
	}

	getChildren(element){
		return Promise.resolve([this.command]);
	}

	getTreeItem(element){
	  const treeItem = new vscode.TreeItem(`New Reliable`);
	  treeItem.command = element;
	  return treeItem;
	}
  }

  /** 
	@param {vscode.ExtensionContext} context 
 */
let state = [];
async function activate(context) {
	try{

		let currentPanel = undefined;
	//	let service = undefined;
	
		console.log("activate");
		const liveshare = await vsls.getApi("phylum.new-reliable");

		
		liveshare.registerTreeDataProvider(vsls.View.Session, new ReliableTreeItem());
		

		let disposable = vscode.commands.registerCommand('new-reliable.helloWorld', function () {
			// The code you place here will be executed every time your command is executed
			
			// Display a message box to the user
			if (!currentPanel)return;        
			
			//vscode.window.showInformationMessage('Hello World from New Reliable!');
			
		});

		context.subscriptions.push(disposable);



		let contentPath = path.join(context.extensionPath, 'WebContent');

		let disposable2 = vscode.commands.registerCommand('new-reliable.start', async () => {
			
			
			
			let serviceName = "newReliable";


			
			console.log(vscode.Uri.file(contentPath));
			console.log(contentPath);
			currentPanel = vscode.window.createWebviewPanel(
				'newReliable', // Identifies the type of the webview. Used internally
				'New Reliable', // Title of the panel displayed to the user
				vscode.ViewColumn.One, // Editor column to show the new webview panel in.
				{
					enableScripts: true, 
					retainContextWhenHidden: true,
					localResourceRoots: [vscode.Uri.file(contentPath)]
				} // Webview options. More on these later.
			
			);


			let timer = null;
			let service = undefined;
			//vscode.window.showInformationMessage("Session Chage");
			if (liveshare.session.role === vsls.Role.Host) {
				service = await liveshare.shareService(serviceName);
				vscode.window.showInformationMessage("Starting as host");
				service.onRequest("state", () => {
					return new Promise(resolve => {
						resolve(state);
					});
				}); 
				currentPanel.webview.postMessage({
					action: "State",
					state : state
				});
			}else if (liveshare.session.role === vsls.Role.Guest) {
				service = await liveshare.getSharedService(serviceName);
				vscode.window.showInformationMessage("Starting as guest");
				let data = await service.request("state", []);
				currentPanel.webview.postMessage({
					action: "State",
					state : data
				});
			}


			service.onNotify("message", (data) => {
				
				currentPanel.webview.postMessage(data);

			});

			
			currentPanel.webview.onDidReceiveMessage(message => {
				if(message.action == "Refresh"){
					currentPanel.webview.html = "stupid";
					currentPanel.webview.html = getWebviewContent();
					console.clear();

				}else if(message.action == "State"){
					state = message.data;
				}else{
					service.notify("message", message);
				}

			}, undefined, context.subscriptions);
			/*
			currentPanel.onDidDispose(() => {
				if(timer!=null)clearInterval(timer);
			}, null, context.subscriptions);*/
			
			currentPanel.webview.html = getWebviewContent();
			
			vscode.commands.executeCommand('workbench.action.webview.openDeveloperTools');
			
		
		});

		context.subscriptions.push(disposable2);


		function getWebviewContent() {
			let file = fs.readFileSync(contentPath+"/index.html").toString();
			console.log("content path")
			console.log("vscode-resource:/"+contentPath);
			
			return handlebars.compile(file)({path: ("vscode-resource:/"+contentPath).replaceAll("\\","/")}) ;
		}


		
		
		//vscode.commands.executeCommand('new-reliable.start');

	}catch(e){
		console.error(e);
	}
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
	console.log("deactivate");
}

module.exports = {
	activate,
	deactivate
}
