// src/SidebarProvider.ts
import * as vscode from 'vscode'
import { ServerMonitor } from './ServerMonitor'
import { RouteParser, Route } from './RouteParser'
import { CerberusLogProvider } from './CerberusLogProvider'  // 👈 ADICIONA!

export class CerberusProvider implements vscode.TreeDataProvider<CerberusItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<CerberusItem | undefined | null | void>()
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event

    private monitor: ServerMonitor
    private parser: RouteParser
    private logsProvider: CerberusLogProvider  // 👈 ADICIONA!
    private routes: Route[] = []
    private isOnline: boolean = false

    constructor(monitor: ServerMonitor, parser: RouteParser) {
        this.monitor = monitor
        this.parser = parser
        this.logsProvider = new CerberusLogProvider()  // 👈 INSTANCIA!
    }

    async refresh() {
        this.isOnline = await this.monitor.ping()
        this.routes = await this.parser.parseRoutes()
        await this.logsProvider.refresh()  // 👈 RECARREGA OS LOGS!
        this._onDidChangeTreeData.fire()
    }

        getTreeItem(element: CerberusItem): vscode.TreeItem {
        return element
    }

    // ============================================
    // 📋 GET CHILDREN (MOSTRA OS LOGS)
    // ============================================
    getChildren(element?: CerberusItem): CerberusItem[] {
        if (!element) {
            // Status do servidor
            const statusIcon = this.isOnline ? '🟢' : '🔴'
            const statusLabel = this.isOnline
                ? `Servidor Online — localhost:${this.monitor.getPort()}`
                : `Servidor Offline — localhost:${this.monitor.getPort()}`

            const statusItem = new CerberusItem(
                `${statusIcon} ${statusLabel}`,
                vscode.TreeItemCollapsibleState.None
            )

            // ============================================
            // 📋 LOGS GROUP (NOVO!)
            // ============================================
            const logsGroup = new CerberusItem(
                `📋 Logs do Servidor`,
                vscode.TreeItemCollapsibleState.Expanded,
                'logs-group'
            )

            // Rotas group
            if (this.routes.length === 0) {
                const noRoutes = new CerberusItem(
                    '📡 Nenhuma rota encontrada',
                    vscode.TreeItemCollapsibleState.None
                )
                return [statusItem, logsGroup, noRoutes]
            }

            const routesGroup = new CerberusItem(
                `📡 Rotas (${this.routes.length})`,
                vscode.TreeItemCollapsibleState.Expanded,
                'group'
            )

            return [statusItem, logsGroup, routesGroup]
        }

        // ============================================
        // 📋 MOSTRAR OS LOGS
        // ============================================
        if (element.contextValue === 'logs-group') {
            const logs = this.logsProvider.getLogs()
            return logs.map(log => {
                const item = new CerberusItem(
                    log,
                    vscode.TreeItemCollapsibleState.None,
                    'log-item'
                )
                
                // ============================================
                // 🎨 CORES POR TIPO DE LOG
                // ============================================
                if (log.includes('❌') || log.includes('ERROR')) {
                    item.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('terminal.ansiRed'))
                } else if (log.includes('⚠️') || log.includes('WARN')) {
                    item.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('terminal.ansiYellow'))
                } else if (log.includes('✅')) {
                    item.iconPath = new vscode.ThemeIcon('pass', new vscode.ThemeColor('terminal.ansiGreen'))
                } else {
                    item.iconPath = new vscode.ThemeIcon('info', new vscode.ThemeColor('terminal.ansiCyan'))
                }
                
                return item
            })
        }

        // ============================================
        // 📡 MOSTRAR AS ROTAS
        // ============================================
        if (element.contextValue === 'group') {
            return this.routes.map(route => {
                const methodEmoji = this.getMethodEmoji(route.method)
                const fullUrl = `http://localhost:${this.monitor.getPort()}${route.path}`
                
                const item = new CerberusItem(
                    `${methodEmoji} ${route.method.padEnd(7)} ${route.path}`,
                    vscode.TreeItemCollapsibleState.None,
                    route.method === 'GET' ? 'route-get' : 'route'
                )
                item.description = route.file
                item.tooltip = fullUrl
                
                item.command = {
                    command: 'cerberus.copyRoute',
                    title: 'Copiar rota',
                    arguments: [fullUrl, route.method]
                }
                
                return item
            })
        }

        return []
    }

    private getMethodEmoji(method: string): string {
        const emojis: { [key: string]: string } = {
            GET: '🔵',
            POST: '🟢',
            PUT: '🟡',
            DELETE: '🔴',
            PATCH: '🟠'
        }
        return emojis[method] || '⚪'
    }
}

// ============================================
// 📦 CERBERUS ITEM
// ============================================
export class CerberusItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly contextValue?: string
    ) {
        super(label, collapsibleState)
    }
}