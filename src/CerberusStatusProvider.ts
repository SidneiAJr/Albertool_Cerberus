// src/CerberusStatusProvider.ts
import * as vscode from 'vscode'
import { ServerMonitor } from './ServerMonitor'

export class CerberusStatusProvider implements vscode.TreeDataProvider<CerberusStatusItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<CerberusStatusItem | undefined | null | void>()
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event

    private monitor: ServerMonitor
    private isOnline: boolean = false

    constructor(monitor: ServerMonitor) {
        this.monitor = monitor
    }

    async refresh() {
        this.isOnline = await this.monitor.ping()
        this._onDidChangeTreeData.fire()
    }

    getTreeItem(element: CerberusStatusItem): vscode.TreeItem {
        return element
    }

    getChildren(): CerberusStatusItem[] {
        const statusIcon = this.isOnline ? '🟢' : '🔴'
        const statusLabel = this.isOnline
            ? `Servidor Online — localhost:${this.monitor.getPort()}`
            : `Servidor Offline — localhost:${this.monitor.getPort()}`

        return [
            new CerberusStatusItem(`${statusIcon} ${statusLabel}`, vscode.TreeItemCollapsibleState.None)
        ]
    }
}

class CerberusStatusItem extends vscode.TreeItem {
    constructor(label: string, collapsibleState: vscode.TreeItemCollapsibleState) {
        super(label, collapsibleState)
    }
}