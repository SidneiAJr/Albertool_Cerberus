// src/CerberusLogsProvider.ts
import * as vscode from 'vscode'
import { CerberusLogProvider } from './CerberusLogProvider'

export class CerberusLogsProvider implements vscode.TreeDataProvider<CerberusLogItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<CerberusLogItem | undefined | null | void>()
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event

    private logsProvider: CerberusLogProvider

    constructor() {
        this.logsProvider = new CerberusLogProvider()
    }

    async refresh() {
        await this.logsProvider.refresh()
        this._onDidChangeTreeData.fire()
    }

    getTreeItem(element: CerberusLogItem): vscode.TreeItem {
        return element
    }

    getChildren(): CerberusLogItem[] {
        const logs = this.logsProvider.getLogs()
        return logs.map(log => {
            const item = new CerberusLogItem(log, vscode.TreeItemCollapsibleState.None)
            
            if (log.includes('❌') || log.includes('ERROR')) {
                item.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('terminal.ansiRed'))
            } else if (log.includes('⚠️') || log.includes('WARN')) {
                item.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('terminal.ansiYellow'))
            } else if (log.includes('✅')) {
                item.iconPath = new vscode.ThemeIcon('pass', new vscode.ThemeColor('terminal.ansiGreen'))
            }
            
            return item
        })
    }
}

class CerberusLogItem extends vscode.TreeItem {
    constructor(label: string, collapsibleState: vscode.TreeItemCollapsibleState) {
        super(label, collapsibleState)
    }
}