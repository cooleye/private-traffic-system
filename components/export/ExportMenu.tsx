'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'

const exportOptions = [
  { value: 'links', label: '导出短链接', icon: '🔗' },
  { value: 'visits', label: '导出访问记录', icon: '📊' },
  { value: 'conversions', label: '导出转化记录', icon: '📈' },
  { value: 'statistics', label: '导出统计数据', icon: '📋' },
]

export default function ExportMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleExport = async (type: string) => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('请先登录')
      return
    }

    setExporting(true)
    setIsOpen(false)

    try {
      const res = await fetch(`/api/export?type=${type}&days=30`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || '导出失败')
        return
      }

      // 获取文件名
      const contentDisposition = res.headers.get('content-disposition')
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/) 
      const filename = filenameMatch ? filenameMatch[1] : `导出数据_${new Date().toISOString().split('T')[0]}.csv`

      // 下载文件
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('导出失败:', error)
      alert('导出失败')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={exporting}
      >
        {exporting ? '⏳ 导出中...' : '📥 导出数据'}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {exportOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleExport(option.value)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
            >
              <span>{option.icon}</span>
              <span className="text-sm text-gray-700">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
