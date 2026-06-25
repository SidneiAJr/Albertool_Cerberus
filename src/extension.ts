import * as vscode from 'vscode'
import { ServerMonitor } from './ServerMonitor'
import { RouteParser } from './RouteParser'
import { CerberusProvider } from './SidebarProvider'

export function activate(context: vscode.ExtensionContext) {
    console.log('🐺 Albertool Cerberus ativado!')

    const monitor = new ServerMonitor(3000)
    const parser = new RouteParser()
    const provider = new CerberusProvider(monitor, parser)

    // ============================================
    // 📋 REGISTRAR PROVIDER
    // ============================================
    vscode.window.registerTreeDataProvider('cerberus-routes', provider)

    // ============================================
    // 🔄 COMANDO DE REFRESH
    // ============================================
    const refreshCmd = vscode.commands.registerCommand('cerberus.refresh', () => {
        provider.refresh()
    })

    // ============================================
    // 📋 COMANDO DE COPIAR ROTA (NOVO!)
    // ============================================
    const copyCmd = vscode.commands.registerCommand('cerberus.copyRoute', async (url: string, method: string) => {
        try {
            // Copia a URL
            await vscode.env.clipboard.writeText(url)
            
            // Mostra mensagem com opção de abrir (se for GET)
            if (method === 'GET') {
                const acao = await vscode.window.showInformationMessage(
                    `📋 Copiado: ${url}`,
                    '🌐 Abrir no navegador'
                )
                if (acao === '🌐 Abrir no navegador') {
                    vscode.env.openExternal(vscode.Uri.parse(url))
                }
            } else {
                vscode.window.showInformationMessage(`📋 Copiado: ${url}`)
            }
        } catch (error) {
            vscode.window.showErrorMessage(`❌ Erro ao copiar: ${error}`)
        }
    })

    // ============================================
    // 🔧 COMANDO DE MUDAR PORTA
    // ============================================
    const setPortCmd = vscode.commands.registerCommand('cerberus.setPort', async () => {
        const input = await vscode.window.showInputBox({
            prompt: 'Digite a porta do servidor',
            value: String(monitor.getPort()),
            validateInput: (val) => isNaN(Number(val)) ? 'Digite um número válido' : null
        })
        if (input) {
            monitor.setPort(Number(input))
            vscode.window.showInformationMessage(`🐺 Cerberus: porta alterada para ${input}`)
            provider.refresh()
        }
    })

    // ============================================
    // ⏰ AUTO REFRESH
    // ============================================
    const interval = setInterval(() => {
        provider.refresh()
    }, 5000)

    // ============================================
    // 🔥 REFRESH INICIAL
    // ============================================
    provider.refresh()

    // ============================================
    // 📦 ADICIONAR TODOS OS COMANDOS
    // ============================================
    context.subscriptions.push(refreshCmd, copyCmd, setPortCmd, {
        dispose: () => clearInterval(interval)
    })
}

export function deactivate() {}