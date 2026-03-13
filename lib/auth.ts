import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key'
const REFRESH_TOKEN_EXPIRES_IN = '30d'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// 生成刷新令牌
export function generateRefreshToken(payload: object): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN })
}

// 验证刷新令牌
export function verifyRefreshToken(token: string): any {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET)
  } catch (error) {
    return null
  }
}

// 检查Token是否即将过期（剩余时间小于1小时）
export function isTokenExpiringSoon(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as { exp?: number }
    if (!decoded || !decoded.exp) return true
    
    const expirationTime = decoded.exp * 1000 // 转换为毫秒
    const currentTime = Date.now()
    const oneHour = 60 * 60 * 1000 // 1小时的毫秒数
    
    return expirationTime - currentTime < oneHour
  } catch (error) {
    return true
  }
}
