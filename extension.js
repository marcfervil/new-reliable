// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require("fs");
let vsls = require("vsls");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
	try{
	let currentPanel = undefined;
//	let service = undefined;
 
	const liveshare = await vsls.getApi();

/*
	if(liveshare.session.role == vsls.Role.Host){
		service = await liveshare.shareService("New Reliable");
		console.log("shared service!")
	}else{
		service = await liveshare.getSharedService("New Reliable");
		console.log("using shared service!")
	}*/
//	vsls.ActivityType.

	const service = (liveshare.session.role == vsls.Role.Host) ? await liveshare.shareService("hbenl.vscode-test-explorer-liveshare") : await liveshare.getSharedService("hbenl.vscode-test-explorer-liveshare");
	console.log(service);
	console.log(liveshare);
	let x = await liveshare.shareService("hbenl.vscode-test-explorer-liveshare") ;
	console.log(x);
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

	service.onNotify("tests", (data) => {
		currentPanel.webview.postMessage(data);
		console.log("recieved");
	});

	let disposable2 = vscode.commands.registerCommand('new-reliable.start', () => {
		// Create and show a new webview
		vscode.window.showInformationMessage('Path: '+__dirname+'/WebContent/index.html');
  
		currentPanel = vscode.window.createWebviewPanel(
		  'newReliable', // Identifies the type of the webview. Used internally
		  'New Reliable', // Title of the panel displayed to the user
		  vscode.ViewColumn.One, // Editor column to show the new webview panel in.
		  {enableScripts: true,allowModal:true} // Webview options. More on these later.
		);
		currentPanel.webview.html = getWebviewContent();
		currentPanel.webview.onDidReceiveMessage(message => {
			//console.log(message);
			service.notify("tests", message);
			
		}, undefined, context.subscriptions);
	
	});

	context.subscriptions.push(disposable2);

	function getWebviewContent() {
		// console.log(fs.readFileSync(__dirname+'/WebContent/index.html').toString());
		return fs.readFileSync(__dirname+'/WebContent/index.html').toString();
	}
	}catch(e){
		console.error(e);
	}
	
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
