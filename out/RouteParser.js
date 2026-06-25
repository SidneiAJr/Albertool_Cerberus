"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteParser = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
class RouteParser {
    async parseRoutes() {
        const routes = [];
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders)
            return routes;
        const root = workspaceFolders[0].uri.fsPath;
        const routeFiles = await this.findRouteFiles(root);
        for (const file of routeFiles) {
            const fileRoutes = this.extractRoutes(file);
            routes.push(...fileRoutes);
        }
        return routes;
    }
    async findRouteFiles(root) {
        const files = [];
        const dirsToSearch = ['routes', 'routers', 'src/routes', 'src/routers', 'Backend/routes', 'Backend/routers'];
        for (const dir of dirsToSearch) {
            const fullPath = path.join(root, dir);
            if (fs.existsSync(fullPath)) {
                const found = fs.readdirSync(fullPath)
                    .filter(f => f.endsWith('.ts') || f.endsWith('.js'))
                    .map(f => path.join(fullPath, f));
                files.push(...found);
            }
        }
        return files;
    }
    extractRoutes(filePath) {
        const routes = [];
        const content = fs.readFileSync(filePath, 'utf-8');
        const fileName = path.basename(filePath);
        // Regex pra pegar router.get('/rota'), app.post('/rota') etc
        const regex = /(?:router|app)\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
        let match;
        while ((match = regex.exec(content)) !== null) {
            routes.push({
                method: match[1].toUpperCase(),
                path: match[2],
                file: fileName
            });
        }
        return routes;
    }
}
exports.RouteParser = RouteParser;
//# sourceMappingURL=RouteParser.js.map