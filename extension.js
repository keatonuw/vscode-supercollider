const vscode = require('vscode');
const path = require('path');
const child = require('child_process');

let _activeTerminal = null;
vscode.window.onDidCloseTerminal((terminal) => {
    if (terminal.name === 'SuperCollider') {
        if (!terminal.tckDisposed) {
            disposeTerminal();
        }
    }
});
function createTerminal() {
    _activeTerminal = vscode.window.createTerminal('SuperCollider');
    return _activeTerminal;
}
function disposeTerminal() {
    _activeTerminal.tckDisposed = true;
    _activeTerminal.dispose();
    _activeTerminal = null;
}
function getTerminal() {
    if (!_activeTerminal) {
        createTerminal();
    }

    return _activeTerminal;
}
// END TERMINAL

function resolve(editor, command) {
    const scPath = vscode.workspace.getConfiguration().get('supercollider.sclangCmd');
    return command
        .replace(/\${file}/g, `${editor.document.fileName}`)
        .replace(/\${sclangCmd}/g, scPath)
}

function run(command) {
    const terminal = getTerminal();

    terminal.show(true);

    vscode.commands.executeCommand('workbench.action.terminal.scrollToBottom');
    terminal.sendText(command, true);
}

function warn(msg) {
    console.log('supercollider.execInTerminal: ', msg)
}

function handleInput(editor) {
    vscode.workspace.saveAll(false);
    let command = "${sclangCmd} ${file}";
    const cmd = resolve(
        editor,
        command
    )

    run(cmd);
}

function handleDocs(context, editor) {
    const scPath = vscode.workspace.getConfiguration().get('supercollider.sclangCmd');
    const scriptPath = context.extensionPath;
    const text = editor.document.getText(editor.selection);

    const cmd = `${scPath} ${scriptPath}/openhelp.scd ${text}`; 
    // note: this may cause an issue on a non-unix OS
    // better path resolution is definitely possible...

    child.exec(cmd);
}

function activate(context) {
    let execInTerminal = vscode.commands.registerCommand('supercollider.execInTerminal', () => {
        const editor = vscode.window.activeTextEditor
        if (!editor) {
            warn('no active editor');
            return;
        }

        handleInput(editor)
    });
    context.subscriptions.push(execInTerminal);

    let killTerminal = vscode.commands.registerCommand('supercollider.killTerminal', () => {
        if(_activeTerminal)
            disposeTerminal();
    });
    context.subscriptions.push(killTerminal);

    let openHelp = vscode.commands.registerCommand('supercollider.openHelp', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            warn('no active editor');
            return;
        }

        handleDocs(context, editor)
    });
    context.subscriptions.push(openHelp);
}
exports.activate = activate;

function deactivate() {
    disposeTerminal();
}
exports.deactivate = deactivate;