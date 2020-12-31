// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require("fs");
let vsls = require("vsls");
let path = require('path');
let handlebars = require("handlebars");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */

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
			currentPanel.webview.postMessage({
				command: "Drag",
				id: "image",
				pos: {x: "50px", y: "100px"}
			});
		});

		context.subscriptions.push(disposable);



		let contentPath = path.join(context.extensionPath, 'WebContent');

		let disposable2 = vscode.commands.registerCommand('new-reliable.start', async () => {
			
			

			let serviceName = "newReliable";
		//	console.log(serviceName);
		//	const service = (liveshare.session.role == vsls.Role.Host) ? await liveshare.shareService(serviceName) : await liveshare.getSharedService(serviceName);
			//console.log(service);
			//console.log(context.workspaceState);
			
/*
			if(service==null || (service!=null && !service.isAvailable)){
				
				if(service==null){
					vscode.window.showInformationMessage('Bad Permissions');
					return ;
				}else{
					if(liveshare.session.role == vsls.Role.Guest){
						console.log("Service: ");
						console.log(service);
						service.onDidChangeIsServiceAvailable((availibility)=>{
							console.log("Availibility change!: "+availibility);
						});
					}


					vscode.window.showInformationMessage('Attempting to setup service as '+liveshare.session.role);
					service.onNotify("message", (data) => {
						//currentPanel.webview.postMessage(data);
						console.log("recieved!!!!!");
						console.log(data);
					});
				}
			}else{
				service.onNotify("message", (data) => {
					//currentPanel.webview.postMessage(data);
					console.log("recieved!!!!!");
					console.log(data);
				});
			}*/
			//liveshare.
			//liveshare.onDidChangeSession(async e => {

			

			let timer = null;
				let service = undefined;
				//vscode.window.showInformationMessage("Session Chage");
				if (liveshare.session.role === vsls.Role.Host) {
					service = await liveshare.shareService(serviceName);
					vscode.window.showInformationMessage("Starting as host");

				}else if (liveshare.session.role === vsls.Role.Guest) {
					service = await liveshare.getSharedService(serviceName);
					vscode.window.showInformationMessage("Starting as guest");
					
				}
				console.log("service started");
				console.log(service);

				service.onNotify("message", (data) => {
					//currentPanel.webview.postMessage(data);
					currentPanel.webview.postMessage(data);
				});

				currentPanel.webview.onDidReceiveMessage(message => {
					service.notify("message", message);
				}, undefined, context.subscriptions);

			//});



			currentPanel = vscode.window.createWebviewPanel(
				'newReliable', // Identifies the type of the webview. Used internally
				'New Reliable', // Title of the panel displayed to the user
				vscode.ViewColumn.One, // Editor column to show the new webview panel in.
				{
					enableScripts: true, 
		
					localResourceRoots: [vscode.Uri.file(contentPath)]
				} // Webview options. More on these later.
			
			);
			currentPanel.onDidDispose(() => {
				if(timer!=null)clearInterval(timer);
			}, null, context.subscriptions);
			
			currentPanel.webview.html = getWebviewContent();
			
			
			
		
		});

		context.subscriptions.push(disposable2);


		function getWebviewContent() {
			// console.log(fs.readFileSync(__dirname+'/WebContent/index.html').toString());
			let file = fs.readFileSync(contentPath+"/index.html").toString();
			//
			return handlebars.compile(file)({path: "vscode-resource://"+contentPath});
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
