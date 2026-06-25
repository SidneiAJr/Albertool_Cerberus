// src/extension.ts
import * as vscode from 'vscode'
import { ServerMonitor } from './ServerMonitor'
import { RouteParser } from './RouteParser'
import { CerberusProvider } from './SidebarProvider'

export function activate(context: vscode.ExtensionContext) {
    console.log('🐺 Albertool Cerberus ativado!')

    const monitor = new ServerMonitor(3000)
    const parser = new RouteParser()

    // ============================================
    // 📋 PROVIDER ÚNICO (JÁ MOSTRA STATUS + LOGS + ROTAS)
    // ============================================
    const provider = new CerberusProvider(monitor, parser)
    vscode.window.registerTreeDataProvider('cerberus-routes', provider)

    // ============================================
    // 🔄 COMANDO DE REFRESH
    // ============================================
    const refreshCmd = vscode.commands.registerCommand('cerberus.refresh', () => {
        provider.refresh()
    })

    // Auto refresh a cada 5 segundos
    const interval = setInterval(() => {
        provider.refresh()
    }, 5000)

    // Refresh inicial
    provider.refresh()

    context.subscriptions.push(refreshCmd, {
        dispose: () => clearInterval(interval)
    })
}

export function deactivate() {}