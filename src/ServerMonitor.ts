import * as http from 'http'

export class ServerMonitor {
    private port: number
    private _isOnline: boolean = false

    constructor(port: number = 3000) {
        this.port = port
    }

    get isOnline(): boolean {
        return this._isOnline
    }

    setPort(port: number) {
        this.port = port
    }

    async ping(): Promise<boolean> {
        return new Promise((resolve) => {
            const req = http.get(`http://localhost:${this.port}`, (res) => {
                this._isOnline = true
                resolve(true)
            })
            req.on('error', () => {
                this._isOnline = false
                resolve(false)
            })
            req.setTimeout(2000, () => {
                this._isOnline = false
                req.destroy()
                resolve(false)
            })
        })
    }

    getPort(): number {
        return this.port
    }
}