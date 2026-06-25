import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'

export class CerberusLogProvider {
    private logs: string[] = []
    private workspaceRoot: string | undefined

    constructor() {
        const folders = vscode.workspace.workspaceFolders
        this.workspaceRoot = folders?.[0]?.uri.fsPath
    }

    // ============================================
    // 🔍 LER E PARSEAR LOGS DO WINSTON
    // ============================================
    async loadLogs(): Promise<string[]> {
        if (!this.workspaceRoot) {
            return ['⚠️ Nenhum projeto aberto']
        }

        // Procura pelos arquivos de log
        const logPaths = [
            path.join(this.workspaceRoot, 'logs', 'combined.log'),
            path.join(this.workspaceRoot, 'logs', 'error.log'),
            path.join(this.workspaceRoot, 'Backend', 'logs', 'combined.log'),
            path.join(this.workspaceRoot, 'Backend', 'logs', 'error.log'),
        ]

        for (const logPath of logPaths) {
            if (fs.existsSync(logPath)) {
                console.log(`📁 Lendo logs de: ${logPath}`)
                const content = fs.readFileSync(logPath, 'utf-8')
                const lines = content.split('\n').filter(Boolean)
                
                // Pega as últimas 15 linhas e converte
                const parsed = lines.slice(-15).map(line => {
                    try {
                        const json = JSON.parse(line)
                        return this.formatLogEntry(json)
                    } catch {
                        // Se não for JSON, mostra raw
                        return line
                    }
                })
                
                return parsed
            }
        }

        return ['📡 Nenhum log encontrado']
    }

    // ============================================
    // 🎨 FORMATAR ENTRADA DE LOG
    // ============================================
    private formatLogEntry(log: any): string {
        const { timestamp, level, message } = log
        
        // Emojis por nível
        const levelEmoji: { [key: string]: string } = {
            'error': '❌',
            'warn': '⚠️',
            'info': 'ℹ️',
            'http': '🌐',
            'debug': '🔍'
        }
        
        const emoji = levelEmoji[level] || '📌'
        const time = timestamp?.split(' ')[1] || '--:--:--'
        
        // Formata: "⏰ 14:32:15 ❌ Erro ao buscar rios"
        return `⏰ ${time} ${emoji} ${message}`
    }

    // ============================================
    // 🔄 RECARREGAR LOGS
    // ============================================
    async refresh() {
        this.logs = await this.loadLogs()
    }

    getLogs(): string[] {
        return this.logs.length > 0 ? this.logs : ['📡 Nenhum log disponível']
    }
}