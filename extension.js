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

	let currentPanel = undefined;
	let service = undefined;
 
	const liveshare = await vsls.getApi();
	//let service = await liveshare.getSharedService("New Reliable");
	//liveshare.session.role
	if(liveshare.session.role == vsls.Role.Host){
		service = await liveshare.shareService("New Reliable");
		console.log("shared service!")
	}else{
		service = await liveshare.getSharedService("New Reliable");
		console.log("using shared service!")
	}
	


	console.log(liveshare);
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "new-reliable" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('new-reliable.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		if (!currentPanel) {
			return;
		  }
		//vscode.window.showInformationMessage('Hello World from New Reliable!');
		currentPanel.webview.postMessage({ command: 'yuh' });
	});

	context.subscriptions.push(disposable);

	context.subscriptions.push(
		vscode.commands.registerCommand('new-reliable.start', () => {
		  // Create and show a new webview
		  vscode.window.showInformationMessage('Path: '+__dirname+'/WebContent/index.html');
	
		  currentPanel = vscode.window.createWebviewPanel(
			'newReliable', // Identifies the type of the webview. Used internally
			'New Reliable', // Title of the panel displayed to the user
			vscode.ViewColumn.One, // Editor column to show the new webview panel in.
			{enableScripts: true,allowModal:true} // Webview options. More on these later.
		  );
		  currentPanel.webview.html = getWebviewContent();
		 
		})

		
	);

	function getWebviewContent() {
		// console.log(fs.readFileSync(__dirname+'/WebContent/index.html').toString());
		return fs.readFileSync(__dirname+'/WebContent/index.html').toString();
	}

	
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
