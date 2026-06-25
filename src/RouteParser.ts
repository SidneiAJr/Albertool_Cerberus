import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

export interface Route {
    method: string
    path: string
    file: string
}

export class RouteParser {
    async parseRoutes(): Promise<Route[]> {
        const routes: Route[] = []
        const workspaceFolders = vscode.workspace.workspaceFolders
        if (!workspaceFolders) return routes

        const root = workspaceFolders[0].uri.fsPath
        const routeFiles = await this.findRouteFiles(root)

        for (const file of routeFiles) {
            const fileRoutes = this.extractRoutes(file)
            routes.push(...fileRoutes)
        }

        return routes
    }

    private async findRouteFiles(root: string): Promise<string[]> {
        const files: string[] = []
        
        // Escaneia o projeto inteiro recursivamente
        this.scanDir(root, files, 0)
        
        return files
    }

    private scanDir(dir: string, files: string[], depth: number): void {
        // Limita profundidade pra não travar em projetos grandes
        if (depth > 6) return

        // Ignora essas pastas
        const ignoredDirs = ['node_modules', '.git', 'out', 'dist', 'build', '.vscode', 'coverage']

        let entries: fs.Dirent[]
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true })
        } catch {
            return
        }

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name)

            if (entry.isDirectory()) {
                if (ignoredDirs.includes(entry.name)) continue
                this.scanDir(fullPath, files, depth + 1)
            } else if (entry.isFile()) {
                // Pega qualquer arquivo .ts ou .js que tenha "rout" no nome
                const name = entry.name.toLowerCase()
                if (
                    (name.endsWith('.ts') || name.endsWith('.js')) &&
                    (name.includes('rout') || name.includes('router'))
                ) {
                    files.push(fullPath)
                }
            }
        }
    }

    private extractRoutes(filePath: string): Route[] {
        const routes: Route[] = []
        
        let content: string
        try {
            content = fs.readFileSync(filePath, 'utf-8')
        } catch {
            return routes
        }

        const fileName = path.basename(filePath)

        // Pega router.get, app.post, riorouters.delete etc
        const regex = /(?:\w+)\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi
        let match

        while ((match = regex.exec(content)) !== null) {
            routes.push({
                method: match[1].toUpperCase(),
                path: match[2],
                file: fileName
            })
        }

        return routes
    }
}