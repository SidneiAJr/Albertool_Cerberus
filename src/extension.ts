// src/extension.ts
import * as vscode from 'vscode'
import { ServerMonitor } from './ServerMonitor'
import { RouteParser } from './RouteParser'
import { CerberusProvider } from './SidebarProvider'
import { CerberusStatusProvider } from './CerberusStatusProvider'
import { CerberusLogsProvider } from './CerberusLogsProvider'

export function activate(context: vscode.ExtensionContext) {
    console.log('🐺 Albertool Cerberus ativado!')

    const monitor = new ServerMonitor(3000)
    const parser = new RouteParser()

    // Cria os providers
    const providers = [
        new CerberusProvider(monitor, parser),
        new CerberusStatusProvider(monitor),
        new CerberusLogsProvider()
    ]

    // Registra os providers
    const viewIds = ['cerberus-routes', 'cerberus-server', 'cerberus-logs']
    providers.forEach((provider, index) => {
        vscode.window.registerTreeDataProvider(viewIds[index], provider)
    })

    // Função de refresh
    const refreshAll = () => providers.forEach(p => p.refresh())

    // Registra comando
    const refreshCmd = vscode.commands.registerCommand('cerberus.refresh', refreshAll)

    // Auto refresh
    const interval = setInterval(refreshAll, 5000)

    // Refresh inicial
    refreshAll()

    context.subscriptions.push(refreshCmd, {
        dispose: () => clearInterval(interval)
    })
}

export function deactivate() {}