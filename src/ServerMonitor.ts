import * as http from 'http'
import * as net from 'net'

export class ServerMonitor {
    private port: number
    private _isOnline: boolean = false
    private commonPorts: number[] = [3000, 3001, 8080, 8000, 5000, 3333, 4200, 5173]

    constructor(port: number = 3000) {
        this.port = port
    }

    get isOnline(): boolean {
        return this._isOnline
    }

    setPort(port: number) {
        this.port = port
    }

    // ============================================
    // 🔍 DETECTA PORTA AUTOMATICAMENTE
    // ============================================
    async detectPort(): Promise<number> {
        console.log('🔍 Procurando servidor em portas comuns...')
        
        for (const port of this.commonPorts) {
            const isOnline = await this.pingPort(port)
            if (isOnline) {
                console.log(`✅ Servidor encontrado na porta ${port}`)
                this.port = port
                this._isOnline = true
                return port
            }
        }
        
        console.log('❌ Nenhum servidor encontrado')
        this._isOnline = false
        return this.port // retorna a porta padrão
    }

    // ============================================
    // 🏓 PING EM UMA PORTA ESPECÍFICA
    // ============================================
    private async pingPort(port: number): Promise<boolean> {
        return new Promise((resolve) => {
            const req = http.get(`http://localhost:${port}`, (res) => {
                resolve(true)
            })
            req.on('error', () => {
                resolve(false)
            })
            req.setTimeout(1000, () => {
                req.destroy()
                resolve(false)
            })
        })
    }

    // ============================================
    // 🏓 PING NA PORTA ATUAL
    // ============================================
    async ping(): Promise<boolean> {
        const result = await this.pingPort(this.port)
        this._isOnline = result
        return result
    }

    // ============================================
    // 🔍 ESCANEAR TODAS AS PORTAS (mais completo)
    // ============================================
    async scanAllPorts(start: number = 3000, end: number = 3010): Promise<number[]> {
        const found: number[] = []
        
        for (let port = start; port <= end; port++) {
            const isOnline = await this.pingPort(port)
            if (isOnline) {
                found.push(port)
                console.log(`✅ Porta ${port} está aberta`)
            }
        }
        
        return found
    }

    getPort(): number {
        return this.port
    }

    // ============================================
    // 🛠️ ADICIONAR PORTAS PERSONALIZADAS
    // ============================================
    addCommonPort(port: number) {
        if (!this.commonPorts.includes(port)) {
            this.commonPorts.push(port)
        }
    }

    getCommonPorts(): number[] {
        return this.commonPorts
    }
}