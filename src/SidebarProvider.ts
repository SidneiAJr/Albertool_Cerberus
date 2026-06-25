import * as vscode from 'vscode'
import { ServerMonitor } from './ServerMonitor'
import { RouteParser, Route } from './RouteParser'

export class CerberusProvider implements vscode.TreeDataProvider<CerberusItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<CerberusItem | undefined | null | void>()
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event

    private monitor: ServerMonitor
    private parser: RouteParser
    private routes: Route[] = []
    private isOnline: boolean = false

    constructor(monitor: ServerMonitor, parser: RouteParser) {
        this.monitor = monitor
        this.parser = parser
    }

    async refresh() {
        this.isOnline = await this.monitor.ping()
        this.routes = await this.parser.parseRoutes()
        this._onDidChangeTreeData.fire()
    }

    getTreeItem(element: CerberusItem): vscode.TreeItem {
        return element
    }

    getChildren(element?: CerberusItem): CerberusItem[] {
        if (!element) {
            // Root — mostra status e grupo de rotas
            const statusIcon = this.isOnline ? '🟢' : '🔴'
            const statusLabel = this.isOnline
                ? `Servidor Online — localhost:${this.monitor.getPort()}`
                : `Servidor Offline — localhost:${this.monitor.getPort()}`

            const statusItem = new CerberusItem(
                `${statusIcon} ${statusLabel}`,
                vscode.TreeItemCollapsibleState.None
            )

            if (this.routes.length === 0) {
                const noRoutes = new CerberusItem(
                    '📡 Nenhuma rota encontrada',
                    vscode.TreeItemCollapsibleState.None
                )
                return [statusItem, noRoutes]
            }

            const routesGroup = new CerberusItem(
                `📡 Rotas (${this.routes.length})`,
                vscode.TreeItemCollapsibleState.Expanded,
                'group'
            )

            return [statusItem, routesGroup]
        }

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
        
        // Clique copia a URL completa
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

export class CerberusItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly contextValue?: string
    ) {
        super(label, collapsibleState)
    }
}