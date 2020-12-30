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
async function activate(context) {
	try{
		let currentPanel = undefined;
	//	let service = undefined;
	
		console.log("activate");
		const liveshare = await vsls.getApi();

		
		

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


		let disposable3 = vscode.commands.registerCommand('new-reliable.undo', function () {
			// The code you place here will be executed every time your command is executed
			
			// Display a message box to the user
			if (!currentPanel)return;        
			
			vscode.window.showInformationMessage('Un-digery-doo?');
			
		});

		context.subscriptions.push(disposable3);

		let contentPath = path.join(context.extensionPath, 'WebContent');

		let disposable2 = vscode.commands.registerCommand('new-reliable.start', async () => {

			

			let serviceName = context.workspaceState._id;
			console.log(serviceName);
			const service = (liveshare.session.role == vsls.Role.Host) ? await liveshare.shareService(serviceName) : await liveshare.getSharedService(serviceName);
			console.log(service);
			console.log(context.workspaceState);
			if(service==null || (service!=null && !service.isAvailable)){
				vscode.window.showInformationMessage('Bad Permissions');
				if(service==null)return ;
			}else{
				service.onNotify("message", (data) => {
					currentPanel.webview.postMessage(data);
					console.log("recieved");
				});
			}

			currentPanel = vscode.window.createWebviewPanel(
				'newReliable', // Identifies the type of the webview. Used internally
				'New Reliable', // Title of the panel displayed to the user
				vscode.ViewColumn.One, // Editor column to show the new webview panel in.
				{
					enableScripts: true, 
		
					localResourceRoots: [vscode.Uri.file(contentPath)]
				} // Webview options. More on these later.
			
			);
			currentPanel.onDidDispose(() => {}, null, context.subscriptions);
			
			currentPanel.webview.html = getWebviewContent();
			
			
			currentPanel.webview.onDidReceiveMessage(message => {
				console.log("sent");
				service.notify("tests", message);
		
			}, undefined, context.subscriptions);
		
		});

		context.subscriptions.push(disposable2);

		function getWebviewContent() {
			// console.log(fs.readFileSync(__dirname+'/WebContent/index.html').toString());
			let file = fs.readFileSync(contentPath+"/index.html").toString();
			//
			return handlebars.compile(file)({path: "vscode-resource://"+contentPath});
		}


		
		
		vscode.commands.executeCommand('new-reliable.start');

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
