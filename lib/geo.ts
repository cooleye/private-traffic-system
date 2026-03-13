// IP 转地域服务
// 注意：这是一个简化版本，实际项目中建议使用专业的 IP 库如 ip2region、GeoIP2 等

interface GeoInfo {
  country: string
  province: string
  city: string
}

// 简单的 IP 地域映射（仅用于演示）
// 实际项目中应该使用专业的 IP 数据库
const ipRanges: { start: number; end: number; geo: GeoInfo }[] = [
  // 北京
  { start: ipToNumber('1.1.1.0'), end: ipToNumber('1.1.1.255'), geo: { country: '中国', province: '北京', city: '北京' } },
  { start: ipToNumber('14.130.0.0'), end: ipToNumber('14.130.255.255'), geo: { country: '中国', province: '北京', city: '北京' } },
  // 上海
  { start: ipToNumber('1.1.8.0'), end: ipToNumber('1.1.8.255'), geo: { country: '中国', province: '上海', city: '上海' } },
  { start: ipToNumber('14.144.0.0'), end: ipToNumber('14.144.255.255'), geo: { country: '中国', province: '上海', city: '上海' } },
  // 广东
  { start: ipToNumber('1.1.16.0'), end: ipToNumber('1.1.16.255'), geo: { country: '中国', province: '广东', city: '广州' } },
  { start: ipToNumber('14.16.0.0'), end: ipToNumber('14.16.255.255'), geo: { country: '中国', province: '广东', city: '深圳' } },
  // 浙江
  { start: ipToNumber('1.1.24.0'), end: ipToNumber('1.1.24.255'), geo: { country: '中国', province: '浙江', city: '杭州' } },
  { start: ipToNumber('14.112.0.0'), end: ipToNumber('14.112.255.255'), geo: { country: '中国', province: '浙江', city: '宁波' } },
  // 江苏
  { start: ipToNumber('1.1.32.0'), end: ipToNumber('1.1.32.255'), geo: { country: '中国', province: '江苏', city: '南京' } },
  { start: ipToNumber('14.84.0.0'), end: ipToNumber('14.84.255.255'), geo: { country: '中国', province: '江苏', city: '苏州' } },
  // 四川
  { start: ipToNumber('1.1.40.0'), end: ipToNumber('1.1.40.255'), geo: { country: '中国', province: '四川', city: '成都' } },
  { start: ipToNumber('14.28.0.0'), end: ipToNumber('14.28.255.255'), geo: { country: '中国', province: '四川', city: '绵阳' } },
  // 湖北
  { start: ipToNumber('1.1.48.0'), end: ipToNumber('1.1.48.255'), geo: { country: '中国', province: '湖北', city: '武汉' } },
  { start: ipToNumber('14.208.0.0'), end: ipToNumber('14.208.255.255'), geo: { country: '中国', province: '湖北', city: '宜昌' } },
  // 山东
  { start: ipToNumber('1.1.56.0'), end: ipToNumber('1.1.56.255'), geo: { country: '中国', province: '山东', city: '济南' } },
  { start: ipToNumber('14.192.0.0'), end: ipToNumber('14.192.255.255'), geo: { country: '中国', province: '山东', city: '青岛' } },
  // 河南
  { start: ipToNumber('1.1.64.0'), end: ipToNumber('1.1.64.255'), geo: { country: '中国', province: '河南', city: '郑州' } },
  { start: ipToNumber('14.224.0.0'), end: ipToNumber('14.224.255.255'), geo: { country: '中国', province: '河南', city: '洛阳' } },
  // 福建
  { start: ipToNumber('1.1.72.0'), end: ipToNumber('1.1.72.255'), geo: { country: '中国', province: '福建', city: '福州' } },
  { start: ipToNumber('14.176.0.0'), end: ipToNumber('14.176.255.255'), geo: { country: '中国', province: '福建', city: '厦门' } },
  // 湖南
  { start: ipToNumber('1.1.80.0'), end: ipToNumber('1.1.80.255'), geo: { country: '中国', province: '湖南', city: '长沙' } },
  { start: ipToNumber('14.240.0.0'), end: ipToNumber('14.240.255.255'), geo: { country: '中国', province: '湖南', city: '株洲' } },
  // 陕西
  { start: ipToNumber('1.1.88.0'), end: ipToNumber('1.1.88.255'), geo: { country: '中国', province: '陕西', city: '西安' } },
  { start: ipToNumber('14.248.0.0'), end: ipToNumber('14.248.255.255'), geo: { country: '中国', province: '陕西', city: '宝鸡' } },
  // 重庆
  { start: ipToNumber('1.1.96.0'), end: ipToNumber('1.1.96.255'), geo: { country: '中国', province: '重庆', city: '重庆' } },
  { start: ipToNumber('14.104.0.0'), end: ipToNumber('14.104.255.255'), geo: { country: '中国', province: '重庆', city: '重庆' } },
  // 辽宁
  { start: ipToNumber('1.1.104.0'), end: ipToNumber('1.1.104.255'), geo: { country: '中国', province: '辽宁', city: '沈阳' } },
  { start: ipToNumber('14.56.0.0'), end: ipToNumber('14.56.255.255'), geo: { country: '中国', province: '辽宁', city: '大连' } },
  // 河北
  { start: ipToNumber('1.1.112.0'), end: ipToNumber('1.1.112.255'), geo: { country: '中国', province: '河北', city: '石家庄' } },
  { start: ipToNumber('14.72.0.0'), end: ipToNumber('14.72.255.255'), geo: { country: '中国', province: '河北', city: '唐山' } },
  // 天津
  { start: ipToNumber('1.1.120.0'), end: ipToNumber('1.1.120.255'), geo: { country: '中国', province: '天津', city: '天津' } },
  { start: ipToNumber('14.196.0.0'), end: ipToNumber('14.196.255.255'), geo: { country: '中国', province: '天津', city: '天津' } },
  // 美国
  { start: ipToNumber('3.0.0.0'), end: ipToNumber('3.255.255.255'), geo: { country: '美国', province: '加利福尼亚', city: '洛杉矶' } },
  { start: ipToNumber('8.0.0.0'), end: ipToNumber('8.255.255.255'), geo: { country: '美国', province: '纽约', city: '纽约' } },
  // 日本
  { start: ipToNumber('1.0.0.0'), end: ipToNumber('1.0.0.255'), geo: { country: '日本', province: '东京', city: '东京' } },
  { start: ipToNumber('1.0.64.0'), end: ipToNumber('1.0.127.255'), geo: { country: '日本', province: '大阪', city: '大阪' } },
  // 新加坡
  { start: ipToNumber('8.128.0.0'), end: ipToNumber('8.255.255.255'), geo: { country: '新加坡', province: '新加坡', city: '新加坡' } },
  // 香港
  { start: ipToNumber('14.0.0.0'), end: ipToNumber('14.0.255.255'), geo: { country: '中国', province: '香港', city: '香港' } },
]

// IP 地址转数字
function ipToNumber(ip: string): number {
  const parts = ip.split('.')
  if (parts.length !== 4) return 0
  
  const nums = parts.map(part => {
    const num = parseInt(part, 10)
    return isNaN(num) || num < 0 || num > 255 ? 0 : num
  })
  
  return (
    (nums[0] << 24) +
    (nums[1] << 16) +
    (nums[2] << 8) +
    nums[3]
  ) >>> 0
}

// 根据 IP 获取地域信息
export function getGeoByIP(ip: string): GeoInfo {
  // 处理本地IP
  if (ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return { country: '本地', province: '本地', city: '本地' }
  }

  const ipNum = ipToNumber(ip)
  if (ipNum === 0) return { country: '未知', province: '未知', city: '未知' }
  
  for (const range of ipRanges) {
    if (ipNum >= range.start && ipNum <= range.end) {
      return range.geo
    }
  }

  // 默认返回未知
  return { country: '未知', province: '未知', city: '未知' }
}

// 获取省份简称（用于地图显示）
export function getProvinceShortName(province: string): string {
  const shortNames: Record<string, string> = {
    '北京': '京',
    '天津': '津',
    '上海': '沪',
    '重庆': '渝',
    '河北': '冀',
    '山西': '晋',
    '辽宁': '辽',
    '吉林': '吉',
    '黑龙江': '黑',
    '江苏': '苏',
    '浙江': '浙',
    '安徽': '皖',
    '福建': '闽',
    '江西': '赣',
    '山东': '鲁',
    '河南': '豫',
    '湖北': '鄂',
    '湖南': '湘',
    '广东': '粤',
    '海南': '琼',
    '四川': '川',
    '贵州': '黔',
    '云南': '滇',
    '陕西': '陕',
    '甘肃': '甘',
    '青海': '青',
    '台湾': '台',
    '内蒙古': '蒙',
    '广西': '桂',
    '西藏': '藏',
    '宁夏': '宁',
    '新疆': '新',
    '香港': '港',
    '澳门': '澳',
  }
  return shortNames[province] || province
}
