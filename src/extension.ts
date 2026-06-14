import * as vscode from 'vscode';
import { convertClassList, convertText } from './converter';

const TOGGLE_COMMAND = 'tailwind-class-convert.toggle';
const CONVERT_COMMAND = 'tailwind-class-convert.convert';
const CONFIGURATION_SECTION = 'tailwindClassConvert';
const MAX_DETECTION_FILE_SIZE = 1024 * 1024;

type EnableMode = 'auto' | 'on' | 'off';

export async function activate(context: vscode.ExtensionContext) {
	const getConfiguration = () => vscode.workspace.getConfiguration(CONFIGURATION_SECTION);
	let detectedTailwind = false;
	let detectionPromise: Promise<boolean> | undefined;
	const detectTailwind = () => {
		detectionPromise ??= detectTailwindWorkspace().catch(() => false);
		return detectionPromise;
	};

	if (getConfiguration().get<EnableMode>('enableMode', 'auto') === 'auto') {
		detectedTailwind = await detectTailwind();
	}

	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = TOGGLE_COMMAND;
	statusBarItem.name = 'Tailwind Class Convert';

	const isEnabled = () => {
		const mode = getConfiguration().get<EnableMode>('enableMode', 'auto');
		return mode === 'on' || (mode === 'auto' && detectedTailwind);
	};
	const supportsDocument = (document: vscode.TextDocument) => {
		const languages = getConfiguration().get<string[]>('languages', []);
		return languages.includes('*') || languages.includes(document.languageId);
	};
	const updateStatusBar = () => {
		const enabled = isEnabled();
		statusBarItem.text = enabled ? '$(check) Tailwind Convert' : '$(circle-slash) Tailwind Convert';
		statusBarItem.tooltip = enabled
			? vscode.l10n.t('Tailwind Class Convert is enabled. Click to disable.')
			: vscode.l10n.t('Tailwind Class Convert is disabled. Click to enable.');

		if (getConfiguration().get<boolean>('showStatusBar', true)) {
			statusBarItem.show();
		} else {
			statusBarItem.hide();
		}
	};

	updateStatusBar();

	const toggleDisposable = vscode.commands.registerCommand(TOGGLE_COMMAND, async () => {
		const enabled = !isEnabled();
		await getConfiguration().update('enableMode', enabled ? 'on' : 'off', vscode.ConfigurationTarget.Workspace);
		updateStatusBar();
		vscode.window.showInformationMessage(vscode.l10n.t(
			enabled ? 'Tailwind Class Convert is now enabled.' : 'Tailwind Class Convert is now disabled.',
		));
	});

	const convertDisposable = vscode.commands.registerCommand(CONVERT_COMMAND, async () => {
		if (!isEnabled()) {
			vscode.window.showInformationMessage(vscode.l10n.t('Enable Tailwind Class Convert from the status bar first.'));
			return;
		}

		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}
		if (!supportsDocument(editor.document)) {
			vscode.window.showInformationMessage(vscode.l10n.t('This file type is not included in Tailwind Class Convert settings.'));
			return;
		}

		const hasSelections = editor.selections.some(selection => !selection.isEmpty);
		const selections = hasSelections
			? editor.selections.filter(selection => !selection.isEmpty)
			: [new vscode.Selection(editor.document.positionAt(0), editor.document.positionAt(editor.document.getText().length))];

		await editor.edit(editBuilder => {
			for (const selection of selections) {
				const original = editor.document.getText(selection);
				const converted = hasSelections ? convertClassList(original) : convertText(original);
				if (converted !== original) {
					editBuilder.replace(selection, converted);
				}
			}
		});
	});

	const saveDisposable = vscode.workspace.onWillSaveTextDocument(event => {
		if (!isEnabled() || !getConfiguration().get<boolean>('convertOnSave', true) || !supportsDocument(event.document)) {
			return;
		}

		const original = event.document.getText();
		const converted = convertText(original);
		if (converted === original) {
			return;
		}

		const fullDocument = new vscode.Range(
			event.document.positionAt(0),
			event.document.positionAt(original.length),
		);
		event.waitUntil(Promise.resolve([vscode.TextEdit.replace(fullDocument, converted)]));
	});

	const configurationDisposable = vscode.workspace.onDidChangeConfiguration(async event => {
		if (event.affectsConfiguration(CONFIGURATION_SECTION)) {
			if (getConfiguration().get<EnableMode>('enableMode', 'auto') === 'auto') {
				detectedTailwind = await detectTailwind();
			}
			updateStatusBar();
		}
	});

	context.subscriptions.push(
		statusBarItem,
		toggleDisposable,
		convertDisposable,
		saveDisposable,
		configurationDisposable,
	);
}

async function detectTailwindWorkspace(): Promise<boolean> {
	if (!vscode.workspace.workspaceFolders?.length) {
		return false;
	}

	const configFiles = await vscode.workspace.findFiles(
		'**/{tailwind.config.js,tailwind.config.cjs,tailwind.config.mjs,tailwind.config.ts}',
		'**/{node_modules,.git}/**',
		1,
	);
	if (configFiles.length > 0) {
		return true;
	}

	const packageFiles = await vscode.workspace.findFiles('**/package.json', '**/{node_modules,.git}/**', 100);
	for (const packageFile of packageFiles) {
		try {
			const content = await readDetectionFile(packageFile);
			if (!content) {
				continue;
			}
			const packageJson = JSON.parse(content) as {
				dependencies?: Record<string, string>;
				devDependencies?: Record<string, string>;
			};
			if (packageJson.dependencies?.tailwindcss || packageJson.devDependencies?.tailwindcss) {
				return true;
			}
		} catch {
			continue;
		}
	}

	const cssFiles = await vscode.workspace.findFiles('**/*.{css,scss,sass,less}', '**/{node_modules,.git,dist,build}/**', 100);
	for (const cssFile of cssFiles) {
		const content = await readDetectionFile(cssFile);
		if (!content) {
			continue;
		}
		if (/@tailwind\s+(?:base|components|utilities)\s*;|@import\s+["']tailwindcss["']/.test(content)) {
			return true;
		}
	}

	return false;
}

async function readDetectionFile(uri: vscode.Uri): Promise<string | undefined> {
	try {
		const stat = await vscode.workspace.fs.stat(uri);
		if (stat.size > MAX_DETECTION_FILE_SIZE) {
			return undefined;
		}
		return Buffer.from(await vscode.workspace.fs.readFile(uri)).toString('utf8');
	} catch {
		return undefined;
	}
}

export function deactivate() {}
