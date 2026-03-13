'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { isTokenExpiringSoon } from './auth'

// 刷新Token的间隔（30分钟）
const REFRESH_INTERVAL = 30 * 60 * 1000

export function useAuth() {
  const router = useRouter()
  const refreshTimeoutRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 刷新Token
  const refreshToken = useCallback(async () => {
    const token = localStorage.getItem('token')
    const refreshToken = localStorage.getItem('refreshToken')

    if (!token || !refreshToken) {
      return false
    }

    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (!res.ok) {
        // 刷新失败，清除登录状态
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        router.push('/login')
        return false
      }

      const data = await res.json()
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return true
    } catch (error) {
      console.error('刷新Token失败:', error)
      return false
    }
  }, [router])

  // 检查并刷新Token
  const checkAndRefreshToken = useCallback(async () => {
    const token = localStorage.getItem('token')

    if (!token) {
      return
    }

    // 检查Token是否即将过期
    if (isTokenExpiringSoon(token)) {
      await refreshToken()
    }
  }, [refreshToken])

  // 设置定时刷新
  useEffect(() => {
    // 立即检查一次
    checkAndRefreshToken()

    // 设置定时器
    refreshTimeoutRef.current = setInterval(() => {
      checkAndRefreshToken()
    }, REFRESH_INTERVAL)

    return () => {
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current)
      }
    }
  }, [checkAndRefreshToken])

  // 监听页面可见性变化
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAndRefreshToken()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [checkAndRefreshToken])

  return { refreshToken }
}

// 封装fetch，自动处理Token过期
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem('token')

  const headers = {
    ...options.headers,
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  const res = await fetch(url, {
    ...options,
    headers,
  })

  // 如果返回401，可能是Token过期
  if (res.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken')
    
    if (refreshToken) {
      try {
        // 尝试刷新Token
        const refreshRes = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })

        if (refreshRes.ok) {
          const data = await refreshRes.json()
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))

          // 使用新Token重试请求
          return fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${data.token}`,
            },
          })
        }
      } catch (error) {
        console.error('自动刷新Token失败:', error)
      }
    }

    // 刷新失败，清除登录状态
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  return res
}
