// IP限流防刷机制
interface RateLimitRecord {
  count: number
  resetTime: number
}

interface RateLimitConfig {
  windowMs: number  // 时间窗口（毫秒）
  maxRequests: number  // 最大请求数
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000,  // 1分钟
  maxRequests: 100,  // 每分钟最多100次请求
}

const strictConfig: RateLimitConfig = {
  windowMs: 60 * 1000,  // 1分钟
  maxRequests: 10,  // 每分钟最多10次请求（用于敏感接口）
}

class RateLimiter {
  private records: Map<string, RateLimitRecord> = new Map()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig = defaultConfig) {
    this.config = config
    // 定期清理过期记录
    setInterval(() => this.cleanup(), config.windowMs)
  }

  isAllowed(ip: string): boolean {
    const now = Date.now()
    const record = this.records.get(ip)

    if (!record || now > record.resetTime) {
      // 新窗口或窗口已过期
      this.records.set(ip, {
        count: 1,
        resetTime: now + this.config.windowMs,
      })
      return true
    }

    if (record.count >= this.config.maxRequests) {
      return false
    }

    record.count++
    return true
  }

  getRemainingRequests(ip: string): number {
    const record = this.records.get(ip)
    if (!record) return this.config.maxRequests
    return Math.max(0, this.config.maxRequests - record.count)
  }

  getResetTime(ip: string): number {
    const record = this.records.get(ip)
    return record?.resetTime || Date.now() + this.config.windowMs
  }

  private cleanup(): void {
    const now = Date.now()
    this.records.forEach((record, ip) => {
      if (now > record.resetTime) {
        this.records.delete(ip)
      }
    })
  }
}

// 默认限流器（一般接口）
export const rateLimiter = new RateLimiter(defaultConfig)

// 严格限流器（敏感接口：登录、注册等）
export const strictRateLimiter = new RateLimiter(strictConfig)

// 获取客户端IP
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  // 开发环境返回固定值
  return '127.0.0.1'
}
