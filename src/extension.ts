
import * as vscode from 'vscode';

async function getUserChoiceForPackageManager() {
	const choicePackageManager = await vscode.window.showInformationMessage(
		`Which package manager would you like to use?`,
		"yarn",
		"npm"
	);
	switch(choicePackageManager) {
		case 'yarn': 
			return 'yarn add';
		case 'npm':
			return 'npm install';
		default:
			return 'yarn add';
	}
}
export function activate(context: vscode.ExtensionContext) {
	
	let disposable = vscode.commands.registerCommand('pin-install.pinInstall',  async () => {

		const choice = await getUserChoiceForPackageManager();
		
		const path = vscode.workspace.workspaceFolders![0];
	
		const requireRegex = /(?<=require\()(.*?)(?=\))/g;
		const importRegex = /(.*import.*)/g;

		const pattern = new vscode.RelativePattern(
			path?.uri.fsPath || '',
			'**/*.{ts,js}'
		);
	
		const uris = await vscode.workspace.findFiles(pattern, '/node_modules/', 100);

		const modules: RegExpMatchArray[] = [];

		const fileText = await Promise.all(uris.map(async (uri) => await vscode.workspace.openTextDocument(uri)));
		
		//for require and import
		fileText.map((file) => {
			const getPackagesWithRequire = file.getText().match(requireRegex);
			const getPackagesWithImport = file.getText().match(importRegex);
			if(getPackagesWithRequire){
				modules.push([...getPackagesWithRequire]);
			}
			if(getPackagesWithImport) {
				const modulesWithImport = getPackagesWithImport.map((dep) => dep?.split(" ")?.pop()?.replaceAll("'", '')) as RegExpMatchArray;
				modules.push([...modulesWithImport]);
			}
		});

		const terminal = vscode.window.createTerminal(`Ext Terminal`);
		//install modules
		modules.flat().map((dep) => {
			terminal.sendText(`${choice} ${dep}`);
		});
		
		vscode.window.showInformationMessage('Installed dependencies');
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
