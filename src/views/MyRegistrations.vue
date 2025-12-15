<template>
  <div class="page-container">
    <!-- 页面头部 - 使用统一样式 -->
    <div class="page-header">
      <div class="page-header-content">
        <div class="page-header-left">
          <h1>我的报名记录</h1>
          <p class="page-header-subtitle">查看和管理您报名的校园活动</p>
        </div>
        <div class="page-header-actions">
          <button @click="$router.push('/activities')" class="btn btn-secondary">
            <span class="icon icon-arrow-left"></span>
            返回活动列表
          </button>
        </div>
      </div>
    </div>


    <!-- 调试信息 -->
    <div class="debug-info" v-if="debugMode">
      <p>用户信息: {{ JSON.stringify(auth.user) }}</p>
      <p>报名记录数量: {{ registrations.length }}</p>
      <p>活动数量: {{ activities.length }}</p>
      <button @click="logData" class="btn-debug">打印数据到控制台</button>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-card">
      <div class="filter-section">
        <select v-model="statusFilter" class="filter-select">
          <option value="">全部状态</option>
          <option value="REGISTERED">已报名</option>
          <option value="CANCELLED">已取消</option>
          <option value="ATTENDED">已参加</option>
        </select>
        <div class="search-box">
          <span class="search-icon icon-search"></span>
          <input
            v-model="searchKeyword"
            placeholder="搜索活动名称..."
            class="search-input"
          >
        </div>
      </div>
      <div class="filter-stats">
        <span>共找到 {{ filteredRegistrations.length }} 条记录</span>
      </div>
    </div>

    <!-- 报名记录列表 -->
    <div class="registrations-list">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state card">
        <div class="spinner"></div>
        <p>加载报名记录中...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="fetchRegistrations" class="btn-primary">重新加载</button>
      </div>

      <!-- 未登录状态 -->
      <div v-else-if="!auth.user" class="empty-state">
        <p>请先登录查看报名记录</p>
        <button @click="$router.push('/login')" class="btn-primary">去登录</button>
      </div>

      <!-- 空状态 -->
      <div v-else-if="filteredRegistrations.length === 0" class="empty-state">
        <p>暂无报名记录</p>
        <button @click="$router.push('/activities')" class="btn-primary">去报名活动</button>
      </div>

      <!-- 报名记录列表 -->
      <div v-else class="registrations-grid">
        <div 
          v-for="registration in filteredRegistrations" 
          :key="registration.id" 
          class="registration-card"
        >
          <div class="activity-info">
            <div class="activity-header">
              <h3 class="activity-title">{{ getActivityTitle(registration.activityId) }}</h3>
              <span :class="['status-badge', getStatusClass(registration.status)]">
                {{ getStatusText(registration.status) }}
              </span>
            </div>
            
            <p class="activity-description">{{ getActivityDescription(registration.activityId) }}</p>
            
            <div class="activity-details">
              <div class="detail-item">
                <span class="detail-label">
                  <span class="detail-icon icon-time"></span>
                  时间：
                </span>
                <span>{{ getActivityTime(registration.activityId) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">
                  <span class="detail-icon icon-location"></span>
                  地点：
                </span>
                <span>{{ getActivityLocation(registration.activityId) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">
                  <span class="detail-icon icon-organization"></span>
                  组织单位：
                </span>
                <span>{{ getActivityOrganizer(registration.activityId) }}</span>
              </div>
            </div>
          </div>

          <div class="registration-info">
            <div class="registration-meta">
              <div class="meta-item">
                <span class="meta-label">报名时间：</span>
                <span class="meta-value">{{ formatDateTime(registration.registrationTime) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">报名状态：</span>
                <span :class="['status-badge', getStatusClass(registration.status)]">
                  {{ getStatusText(registration.status) }}
                </span>
              </div>
            </div>

            <div v-if="registration.notes" class="registration-notes">
              <strong><span class="notes-icon icon-note"></span> 备注：</strong> {{ registration.notes }}
            </div>

            <div class="registration-actions">
              <button 
                v-if="registration.status === 'REGISTERED'"
                @click="cancelRegistration(registration.id)"
                class="btn-cancel"
                :disabled="actionLoading"
              >
                {{ actionLoading ? '取消中...' : '取消报名' }}
              </button>
              
              <button 
                @click="viewActivityDetails(registration.activityId)"
                class="btn-view"
              >
                查看活动详情
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 确认取消对话框 -->
    <div v-if="showCancelConfirm" class="modal-overlay">
      <div class="confirm-dialog">
        <h3>确认取消报名</h3>
        <p>确定要取消报名「{{ selectedActivityTitle }}」吗？</p>
        <div class="dialog-actions">
          <button @click="showCancelConfirm = false" class="btn-secondary">再想想</button>
          <button @click="confirmCancel" class="btn-danger">确定取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import axios from 'axios'

const router = useRouter()
const auth = useAuth()

// 响应式数据
const registrations = ref([])
const activities = ref([])
const loading = ref(false)
const actionLoading = ref(false)
const error = ref('')
const searchKeyword = ref('')
const statusFilter = ref('')
const showCancelConfirm = ref(false)
const selectedRegistrationId = ref(null)
const selectedActivityTitle = ref('')
const debugMode = ref(false) // 设置为 true 可以开启调试信息

// 调试函数
const logData = () => {
  console.log('=== 报名记录数据调试 ===')
  console.log('用户信息:', auth.user.value)
  console.log('报名记录:', registrations.value)
  console.log('活动数据:', activities.value)
  console.log('筛选后的记录:', filteredRegistrations.value)
}

// 获取报名记录
const fetchRegistrations = async () => {
  // 检查用户登录状态
  if (!auth.user.value) {
    error.value = '请先登录'
    loading.value = false
    return
  }

  loading.value = true
  error.value = ''
  
  try {
    console.log('开始获取报名记录，用户ID:', auth.user.value?.id)

    // 验证并规范 userId
    const rawId = auth.user.value?.id
    const userId = rawId == null ? null : (typeof rawId === 'number' ? rawId : Number(rawId))
    if (!userId || Number.isNaN(userId)) {
      throw new Error('当前用户 ID 无效，无法获取报名记录')
    }

    const url = `/api/registrations/user/${userId}`
    console.log('请求报名记录 URL:', url)

    // 获取用户的报名记录
    const registrationsResponse = await axios.get(url)
    registrations.value = registrationsResponse.data
    console.log('获取到报名记录数量:', registrations.value.length)
    
    // 获取所有相关活动的信息
    await fetchActivities()
    
  } catch (err) {
    console.error('获取报名记录失败:', err)
    handleApiError(err)
  } finally {
    loading.value = false
  }
}

// 获取活动信息
const fetchActivities = async () => {
  try {
    // 获取所有活动，或者只获取相关的活动
    const activityIds = registrations.value.map(reg => reg.activityId)
    if (activityIds.length === 0) return

    // 这里可以根据需要调整API调用
    const response = await axios.get('/api/activities')
    activities.value = response.data
    console.log('获取到活动数量:', activities.value.length)
    
  } catch (err) {
    console.error('获取活动信息失败:', err)
    // 不阻止页面显示，即使活动信息获取失败
  }
}

// API错误处理
const handleApiError = (err) => {
  if (err.response?.status === 401) {
    error.value = '登录已过期，请重新登录'
    router.push('/login')
  } else if (err.response?.status === 404) {
    error.value = '未找到报名记录'
  } else if (err.response?.status === 400) {
    error.value = '请求参数错误'
  } else {
    error.value = `获取数据失败: ${err.response?.data?.message || err.message || '未知错误'}`
  }
}

// 根据活动ID获取活动信息
const getActivityById = (activityId) => {
  const activity = activities.value.find(activity => activity.id === activityId)
  if (!activity) {
    console.warn(`未找到活动ID为 ${activityId} 的活动信息`)
  }
  return activity
}

const getActivityTitle = (activityId) => {
  const activity = getActivityById(activityId)
  return activity ? activity.title : '活动信息加载中...'
}

const getActivityDescription = (activityId) => {
  const activity = getActivityById(activityId)
  return activity ? activity.description : '暂无描述'
}

const getActivityTime = (activityId) => {
  const activity = getActivityById(activityId)
  return activity ? formatDateTime(activity.startTime) : '时间未知'
}

const getActivityLocation = (activityId) => {
  const activity = getActivityById(activityId)
  return activity ? activity.location : '地点未知'
}

const getActivityOrganizer = (activityId) => {
  const activity = getActivityById(activityId)
  return activity ? activity.organizer : '组织单位未知'
}

// 取消报名
const cancelRegistration = (registrationId) => {
  const registration = registrations.value.find(r => r.id === registrationId)
  if (registration) {
    const activity = getActivityById(registration.activityId)
    selectedActivityTitle.value = activity ? activity.title : '该活动'
    selectedRegistrationId.value = registrationId
    showCancelConfirm.value = true
  }
}

// 确认取消报名
const confirmCancel = async () => {
  if (!selectedRegistrationId.value) return
  
  actionLoading.value = true
    try {
    await axios.delete(`/api/registrations/${selectedRegistrationId.value}`, {
      params: { userId: auth.user.value?.id }
    })
    alert('取消报名成功')
    
    // 刷新数据
    await fetchRegistrations()
    
  } catch (err) {
    console.error('取消报名失败:', err)
    const errorMsg = err.response?.data?.message || err.message || '取消报名失败'
    alert(`取消报名失败: ${errorMsg}`)
  } finally {
    actionLoading.value = false
    showCancelConfirm.value = false
    selectedRegistrationId.value = null
  }
}

// 查看活动详情
const viewActivityDetails = (activityId) => {
  router.push(`/activities#${activityId}`)
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  try {
    return new Date(dateTime).toLocaleString('zh-CN')
  } catch {
    return '日期格式错误'
  }
}

// 获取状态样式
const getStatusClass = (status) => {
  const statusMap = {
    'REGISTERED': 'status-registered',
    'CANCELLED': 'status-cancelled',
    'ATTENDED': 'status-attended',
    'PENDING': 'status-pending'
  }
  return statusMap[status] || 'status-registered'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'REGISTERED': '已报名',
    'CANCELLED': '已取消',
    'ATTENDED': '已参加',
    'PENDING': '审核中'
  }
  return statusMap[status] || status
}

// 筛选报名记录
const filteredRegistrations = computed(() => {
  let filtered = registrations.value
  
  // 状态筛选
  if (statusFilter.value) {
    filtered = filtered.filter(registration => registration.status === statusFilter.value)
  }
  
  // 关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    filtered = filtered.filter(registration => {
      const activity = getActivityById(registration.activityId)
      if (!activity) return false
      
      return activity.title.toLowerCase().includes(keyword) ||
             activity.description.toLowerCase().includes(keyword)
    })
  }
  
  // 按报名时间倒序排列
  return filtered.sort((a, b) => new Date(b.registrationTime) - new Date(a.registrationTime))
})

// 初始化数据
onMounted(() => {
  console.log('=== 我的报名记录页面调试 ===')
  console.log('完整的auth对象:', auth)
  console.log('auth.user类型:', typeof auth.user.value)
  console.log('auth.user值:', auth.user.value)
  console.log('auth.user?.id:', auth.user.value?.id)
  console.log('localStorage token:', localStorage.getItem('token'))
  console.log('localStorage user:', localStorage.getItem('user'))
  
  // 尝试从 localStorage 获取用户信息
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    try {
      const userData = JSON.parse(storedUser)
      console.log('localStorage中的用户信息:', userData)
    } catch (e) {
      console.error('解析localStorage用户信息失败:', e)
    }
  }

  if (auth.user.value && auth.user.value.id) {
    console.log('用户已登录，开始获取报名记录')
    fetchRegistrations()
  } else {
    console.log('用户未登录或用户信息不完整')
    error.value = '请先登录'
    loading.value = false
  }
})
</script>

<style scoped>
/* 修复页面背景色 */
.page-container {
  background: white !important;
  background-color: white !important;
}
.header-content {
  display: flex;
  flex-direction: column;
}

.header-content h1 {
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.header-subtitle {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0;
}

/* 筛选卡片 - 调整宽度和间距 */
.filter-card {
  background: white;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  border: 1px solid var(--border);
  width: 100%;
  box-sizing: border-box;
}

/* 报名记录卡片 - 调整为单栏布局，与其他页面卡片一致 */
.registration-card {
  background: white;
  border-radius: 6px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  border: 1px solid var(--border);
  transition: all 0.2s ease;
  margin-bottom: 16px;
  width: 100%;
  box-sizing: border-box;
}

.registration-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

/* 移除原来的两栏网格布局，改为块级元素堆叠 */
.activity-info, .registration-info {
  width: 100%;
}

/* 确保所有内容在卡片内正确排列 */
.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

/* 确保按钮宽度合适 */
.btn-primary, .btn-secondary, .btn-cancel, .btn-view {
  min-width: 120px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .my-registrations {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .btn-secondary {
    width: 100%;
  }
  
  .registration-card {
    padding: 16px;
  }
  
  .activity-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .status-badge {
    margin-left: 0;
  }
}

.my-registrations {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  font-family: 'Segoe UI', system-ui, sans-serif;
}


.header-content {
  flex: 1;
}

.header-content h1 {
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 6px 0;
}

.header-subtitle {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* 调试信息 - 保持不变 */
.debug-info {
  background: var(--bg-soft);
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  border-left: 3px solid var(--brand-primary);
  font-size: 13px;
}

.debug-info p {
  margin: 4px 0;
  color: var(--text-muted);
}

.btn-debug {
  background: #909399;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  margin-top: 8px;
}

.btn-debug:hover {
  background: #a6a9ad;
}

/* 筛选卡片 - 修改为与其他页面一致 */
.filter-card {
  background: white;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  border: 1px solid var(--border);
}

.filter-section {
  display: flex;
  gap: 16px;
  align-items: center;
}

.filter-select {
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 14px;
  background: white;
  color: var(--text-primary);
  cursor: pointer;
  min-width: 140px;
}

.filter-select:focus {
  outline: none;
  border-color: var(--brand-primary);
}

.search-box {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--brand-primary);
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 34px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 14px;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px rgba(131, 183, 225, 0.2);
}

.filter-stats {
  margin-top: 12px;
  color: var(--text-muted);
  font-size: 13px;
  text-align: right;
}

/* 状态指示器 - 保持原有样式 */
.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-state p, .error-state p, .empty-state p {
  margin-bottom: 20px;
  color: var(--text-muted);
  font-size: 15px;
}

.error-state p {
  color: #f56c6c;
}

.empty-state {
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  border: 1px solid var(--border);
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border);
  border-top: 3px solid var(--brand-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 报名记录网格 - 简化并与其他页面保持一致 */
.registrations-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 报名记录卡片 - 简化布局 */
.registration-card {
  background: white;
  border-radius: 6px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  border: 1px solid var(--border);
  transition: all 0.2s ease;
}

.registration-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.activity-title {
  margin: 0;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
  flex: 1;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  margin-left: 12px;
}

.status-registered {
  background: var(--brand-accent);
  color: var(--brand-primary);
  border: 1px solid var(--brand-primary);
}

.status-cancelled {
  background: #fef0f0;
  color: #f56c6c;
  border: 1px solid #f56c6c;
}

.status-attended {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #52c41a;
}

.status-pending {
  background: #f0f0f0;
  color: #666;
  border: 1px solid #ddd;
}

.activity-description {
  color: var(--text-muted);
  margin-bottom: 16px;
  line-height: 1.5;
  font-size: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.activity-details {
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
}

.detail-label {
  color: var(--text-muted);
  min-width: 80px;
}

.detail-icon {
  font-size: 12px;
  color: var(--brand-primary);
  margin-right: 4px;
}

/* 报名信息 - 简化布局 */
.registration-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  color: var(--text-muted);
  font-size: 12px;
}

.meta-value {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 500;
}

.registration-notes {
  background: var(--bg-soft);
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 13px;
  color: var(--text-muted);
  border-left: 3px solid var(--brand-primary);
}

.registration-actions {
  display: flex;
  gap: 10px;
}

/* 按钮样式 - 简化并统一 */
.btn-primary, .btn-secondary, .btn-cancel, .btn-view, .btn-danger {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  flex: 1;
}

.btn-primary {
  background: var(--brand-primary);
  color: white;
}

.btn-primary:hover {
  background: #6aa3d6;
}

.btn-secondary {
  background: var(--brand-highlight);
  color: #222;
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: #f3db60;
}

.btn-cancel {
  background: var(--brand-highlight);
  color: #222;
  border: 1px solid var(--border);
}

.btn-cancel:hover:not(:disabled) {
  background: #f3db60;
}

.btn-view {
  background: #909399;
  color: white;
}

.btn-view:hover {
  background: #a6a9ad;
}

.btn-danger {
  background: #f56c6c;
  color: white;
}

.btn-danger:hover {
  background: #f78989;
}

button:disabled {
  background: #c0c4cc;
  cursor: not-allowed;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirm-dialog {
  background: white;
  padding: 24px;
  border-radius: 6px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.confirm-dialog h3 {
  margin: 0 0 16px 0;
  color: var(--text-primary);
  font-size: 18px;
}

.confirm-dialog p {
  margin-bottom: 20px;
  color: var(--text-muted);
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .my-registrations {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .btn-secondary, .btn-primary {
    width: 100%;
  }
  
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-select {
    min-width: 100%;
  }
  
  .registration-card {
    padding: 16px;
  }
  
  .activity-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .status-badge {
    margin-left: 0;
  }
  
  .registration-meta {
    flex-direction: column;
    gap: 12px;
  }
  
  .registration-actions {
    flex-direction: column;
  }
  
  .btn-cancel, .btn-view {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .my-registrations {
    padding: 12px;
  }
  
  .page-header h1 {
    font-size: 20px;
  }
  
  .filter-card {
    padding: 16px;
  }
  
  .activity-title {
    font-size: 16px;
  }
  
  .activity-description {
    font-size: 13px;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .detail-label {
    min-width: auto;
  }
}
/* 修改MyRegistrations.vue的CSS部分 */

.my-registrations {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  font-family: 'Segoe UI', system-ui, sans-serif;
  width: 100%;
  box-sizing: border-box;
}



.header-content h1 {
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.header-subtitle {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0;
}

/* 确保所有内容在卡片内正确排列 */
.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

/* 确保按钮宽度合适 */
.btn-primary, .btn-secondary, .btn-cancel, .btn-view {
  min-width: 120px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .my-registrations {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .btn-secondary {
    width: 100%;
  }
  
  .registration-card {
    padding: 16px;
  }
  
  .activity-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .status-badge {
    margin-left: 0;
  }
}
</style>