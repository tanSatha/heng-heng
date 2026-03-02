export const useLotteryHelpers = () => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('th-TH', {
      day: 'numeric', month: 'short', year: '2-digit'
    })
  }

  const getTypeEmoji = (type: string) => {
    if (!type) return '❓'
    return type === 'THAI' ? '🇹🇭' : '🇱🇦'
  }

  const getTypeLabel = (type: string) => {
    if (!type) return 'ไม่ระบุ'
    return type === 'THAI' ? 'หวยไทย' : 'หวยลาว'
  }
  
  const viewDetail = (id: number) => {
    return navigateTo(`/lottery/${id}`)
  }

  return { formatDate, getTypeEmoji, getTypeLabel, viewDetail }
}
