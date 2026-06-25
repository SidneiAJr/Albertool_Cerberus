"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CerberusItem = exports.CerberusProvider = void 0;
const vscode = require("vscode");
class CerberusProvider {
    constructor(monitor, parser) {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.routes = [];
        this.isOnline = false;
        this.monitor = monitor;
        this.parser = parser;
    }
    async refresh() {
        this.isOnline = await this.monitor.ping();
        this.routes = await this.parser.parseRoutes();
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            // Root — mostra status e grupo de rotas
            const statusIcon = this.isOnline ? '🟢' : '🔴';
            const statusLabel = this.isOnline
                ? `Servidor Online — localhost:${this.monitor.getPort()}`
                : `Servidor Offline — localhost:${this.monitor.getPort()}`;
            const statusItem = new CerberusItem(`${statusIcon} ${statusLabel}`, vscode.TreeItemCollapsibleState.None);
            if (this.routes.length === 0) {
                const noRoutes = new CerberusItem('📡 Nenhuma rota encontrada', vscode.TreeItemCollapsibleState.None);
                return [statusItem, noRoutes];
            }
            const routesGroup = new CerberusItem(`📡 Rotas (${this.routes.length})`, vscode.TreeItemCollapsibleState.Expanded, 'group');
            return [statusItem, routesGroup];
        }
        if (element.contextValue === 'group') {
            return this.routes.map(route => {
                const methodEmoji = this.getMethodEmoji(route.method);
                const fullUrl = `http://localhost:${this.monitor.getPort()}${route.path}`;
                const item = new CerberusItem(`${methodEmoji} ${route.method.padEnd(7)} ${route.path}`, vscode.TreeItemCollapsibleState.None, route.method === 'GET' ? 'route-get' : 'route');
                item.description = route.file;
                item.tooltip = fullUrl;
                // Clique copia a URL completa
                item.command = {
                    command: 'cerberus.copyRoute',
                    title: 'Copiar rota',
                    arguments: [fullUrl, route.method]
                };
                return item;
            });
        }
        return [];
    }
    getMethodEmoji(method) {
        const emojis = {
            GET: '🔵',
            POST: '🟢',
            PUT: '🟡',
            DELETE: '🔴',
            PATCH: '🟠'
        };
        return emojis[method] || '⚪';
    }
}
exports.CerberusProvider = CerberusProvider;
class CerberusItem extends vscode.TreeItem {
    constructor(label, collapsibleState, contextValue) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.contextValue = contextValue;
    }
}
exports.CerberusItem = CerberusItem;
//# sourceMappingURL=SidebarProvider.js.map