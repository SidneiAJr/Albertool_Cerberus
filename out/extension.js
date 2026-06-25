"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const ServerMonitor_1 = require("./ServerMonitor");
const RouteParser_1 = require("./RouteParser");
const SidebarProvider_1 = require("./SidebarProvider");
function activate(context) {
    console.log('🐺 Albertool Cerberus ativado!');
    const monitor = new ServerMonitor_1.ServerMonitor(3000);
    const parser = new RouteParser_1.RouteParser();
    const provider = new SidebarProvider_1.CerberusProvider(monitor, parser);
    // Registra a sidebar
    vscode.window.registerTreeDataProvider('cerberus-routes', provider);
    // Comando de refresh
    const refreshCmd = vscode.commands.registerCommand('cerberus.refresh', () => {
        provider.refresh();
    });
    // Comando pra mudar porta
    const setPortCmd = vscode.commands.registerCommand('cerberus.setPort', async () => {
        const input = await vscode.window.showInputBox({
            prompt: 'Digite a porta do servidor',
            value: String(monitor.getPort()),
            validateInput: (val) => isNaN(Number(val)) ? 'Digite um número válido' : null
        });
        if (input) {
            monitor.setPort(Number(input));
            vscode.window.showInformationMessage(`🐺 Cerberus: porta alterada para ${input}`);
            provider.refresh();
        }
    });
    // Auto refresh a cada 5 segundos
    const interval = setInterval(() => {
        provider.refresh();
    }, 5000);
    // Refresh ao salvar arquivo
    const onSave = vscode.workspace.onDidSaveTextDocument(() => {
        provider.refresh();
    });
    // Copiar rota
    const copyCmd = vscode.commands.registerCommand('cerberus.copyRoute', async (url, method) => {
        await vscode.env.clipboard.writeText(url);
        // Se for GET abre no browser também
        if (method === 'GET') {
            const abrir = await vscode.window.showInformationMessage(`📋 Copiado: ${url}`, 'Abrir no Browser');
            if (abrir === 'Abrir no Browser') {
                vscode.env.openExternal(vscode.Uri.parse(url));
            }
        }
        else {
            vscode.window.showInformationMessage(`📋 Copiado: ${url}`);
        }
    });
    context.subscriptions.push(refreshCmd, setPortCmd, copyCmd, onSave, {
        dispose: () => clearInterval(interval)
    });
    // Refresh inicial
    provider.refresh();
    context.subscriptions.push(refreshCmd, setPortCmd, onSave, {
        dispose: () => clearInterval(interval)
    });
}
function deactivate() { }
//# sourceMappingURL=extension.js.map