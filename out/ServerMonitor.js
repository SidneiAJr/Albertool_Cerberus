"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerMonitor = void 0;
const http = require("http");
class ServerMonitor {
    constructor(port = 3000) {
        this._isOnline = false;
        this.port = port;
    }
    get isOnline() {
        return this._isOnline;
    }
    setPort(port) {
        this.port = port;
    }
    async ping() {
        return new Promise((resolve) => {
            const req = http.get(`http://localhost:${this.port}`, (res) => {
                this._isOnline = true;
                resolve(true);
            });
            req.on('error', () => {
                this._isOnline = false;
                resolve(false);
            });
            req.setTimeout(2000, () => {
                this._isOnline = false;
                req.destroy();
                resolve(false);
            });
        });
    }
    getPort() {
        return this.port;
    }
}
exports.ServerMonitor = ServerMonitor;
//# sourceMappingURL=ServerMonitor.js.map