<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-header-content">
        <div class="page-header-left">
          <h1>活动管理</h1>
          <p class="page-header-subtitle">管理校园活动，包括发布、编辑、取消等操作</p>
        </div>
        <div class="page-header-actions">
          <button @click="$router.push('/activities')" class="btn btn-secondary">
            查看前台
          </button>
          <router-link to="/activities/create" class="btn btn-primary">
            发布新活动
          </router-link>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-number">{{ stats.totalActivities }}</div>
        <div class="stat-label">总活动数</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.publishedActivities }}</div>
        <div class="stat-label">已发布</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.totalRegistrations }}</div>
        <div class="stat-label">总报名数</div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-card">
      <div class="filter-section">
        <input
          v-model="searchKeyword"
          placeholder="搜索活动名称..."
          class="search-input"
        >
        <select v-model="statusFilter" class="filter-select">
          <option value="">全部状态</option>
          <option value="DRAFT">草稿</option>
          <option value="PUBLISHED">已发布</option>
          <option value="CANCELLED">已取消</option>
          <option value="COMPLETED">已结束</option>
        </select>
      </div>
    </div>

    <!-- 活动列表 -->
    <div class="activities-table">
      <table>
        <thead>
          <tr>
            <th>活动名称</th>
            <th>状态</th>
            <th>时间</th>
            <th>地点</th>
            <th>报名人数</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="activity in filteredActivities" :key="activity.id">
            <td class="activity-title">{{ activity.title }}</td>
            <td>
              <span :class="['status-badge', getStatusClass(activity.status)]">
                {{ getStatusText(activity.status) }}
              </span>
            </td>
            <td>{{ formatDateTime(activity.startTime) }}</td>
            <td>{{ activity.location }}</td>
            <td>{{ activity.currentParticipants }}/{{ activity.maxParticipants }}</td>
            <td class="actions">
              <button @click="viewRegistrations(activity.id)" class="btn-view">查看报名</button>
              <button @click="editActivity(activity)" class="btn-edit">编辑</button>
              <button 
                @click="updateActivityStatus(activity.id, 'PUBLISHED')" 
                v-if="activity.status === 'DRAFT'"
                class="btn-publish"
              >
                发布
              </button>
              <button 
                @click="updateActivityStatus(activity.id, 'CANCELLED')" 
                v-if="activity.status === 'PUBLISHED'"
                class="btn-cancel"
              >
                取消
              </button>
              <button 
                @click="updateActivityStatus(activity.id, 'COMPLETED')" 
                v-if="activity.status === 'PUBLISHED'"
                class="btn-complete"
              >
                结束
              </button>
              <button @click="deleteActivity(activity.id)" class="btn-delete">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredActivities.length === 0" class="empty-state">
      <p>暂无活动数据</p>
      <router-link to="/activities/create" class="btn-primary">发布第一个活动</router-link>
    </div>

    <!-- 报名详情模态框 -->
    <div v-if="showRegistrationsModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>活动报名详情 - {{ selectedActivity?.title }}</h3>
          <button @click="showRegistrationsModal = false" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div v-if="activityRegistrations.length === 0" class="empty-state">
            <p>暂无报名记录</p>
          </div>
          <div v-else class="registrations-list">
            <div v-for="registration in activityRegistrations" :key="registration.id" class="registration-item">
              <span class="user-name">{{ getUserName(registration.userId) }}</span>
              <span :class="['status-badge', getRegistrationStatusClass(registration.status)]">
                {{ getRegistrationStatusText(registration.status) }}
              </span>
              <span class="registration-time">{{ formatDateTime(registration.registrationTime) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import axios from 'axios'
import { useRouter } from 'vue-router'

const auth = useAuth()
const router = useRouter()
const activities = ref([])
const allUsers = ref([])
const activityRegistrations = ref([])
const searchKeyword = ref('')
const statusFilter = ref('')
const loading = ref(false)
const showRegistrationsModal = ref(false)
const selectedActivity = ref(null)

const stats = reactive({
  totalActivities: 0,
  publishedActivities: 0,
  totalRegistrations: 0
})

// 获取所有活动（包括草稿）
const fetchActivities = async () => {
  try {
    console.log('开始获取活动数据...')
    const response = await axios.get('/api/activities')
    console.log('API响应状态:', response.status)
    console.log('获取到的活动数据:', response.data)
    
    activities.value = response.data
    console.log('设置后的activities:', activities.value)
    
    updateStats()
  } catch (error) {
    console.error('获取活动列表失败:', error)
    console.error('错误详情:', error.response)
    alert('获取活动列表失败: ' + error.message)
  }
}
// 更新统计信息
const updateStats = () => {
  stats.totalActivities = activities.value.length
  stats.publishedActivities = activities.value.filter(a => a.status === 'PUBLISHED').length
  stats.totalRegistrations = activities.value.reduce((sum, activity) => sum + activity.currentParticipants, 0)
}

// 查看活动报名详情
const viewRegistrations = async (activityId) => {
  try {
    const response = await axios.get(`/api/registrations/activity/${activityId}`)
    activityRegistrations.value = response.data
    selectedActivity.value = activities.value.find(a => a.id === activityId)
    showRegistrationsModal.value = true
  } catch (error) {
    console.error('获取报名详情失败:', error)
    alert('获取报名详情失败')
  }
}

// 更新活动状态
const updateActivityStatus = async (activityId, status) => {
  const statusText = {
    'PUBLISHED': '发布',
    'CANCELLED': '取消',
    'COMPLETED': '结束'
  }[status]

  if (!confirm(`确定要${statusText}这个活动吗？`)) return

  try {
    await axios.patch(`/api/activities/${activityId}/status?status=${status}`)
    alert(`活动已${statusText}`)
    fetchActivities() // 刷新列表
  } catch (error) {
    alert(`操作失败: ${error.response?.data || error.message}`)
  }
}

// 编辑活动
const editActivity = (activity) => {
  console.log('编辑活动:', activity.id)
  // 跳转到编辑页面
  router.push(`/dashboard/activities/edit/${activity.id}`)
}

// 删除活动
const deleteActivity = async (activityId) => {
  if (!confirm('确定要删除这个活动吗？此操作不可恢复！')) return
  
  try {
    await axios.delete(`/api/activities/${activityId}`)
    alert('删除成功')
    fetchActivities()
  } catch (error) {
    alert('删除失败')
  }
}

// 根据用户ID获取用户名（需要后端支持）
const getUserName = (userId) => {
  // 这里需要根据userId获取用户名，暂时返回ID
  return `用户${userId}`
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 获取状态样式
const getStatusClass = (status) => {
  const statusMap = {
    'DRAFT': 'status-draft',
    'PUBLISHED': 'status-published',
    'CANCELLED': 'status-cancelled',
    'COMPLETED': 'status-completed'
  }
  return statusMap[status] || 'status-draft'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'DRAFT': '草稿',
    'PUBLISHED': '已发布',
    'CANCELLED': '已取消',
    'COMPLETED': '已结束'
  }
  return statusMap[status] || status
}

// 获取报名状态样式
const getRegistrationStatusClass = (status) => {
  const statusMap = {
    'REGISTERED': 'status-registered',
    'CANCELLED': 'status-cancelled', 
    'ATTENDED': 'status-attended'
  }
  return statusMap[status] || 'status-registered'
}

// 获取报名状态文本
const getRegistrationStatusText = (status) => {
  const statusMap = {
    'REGISTERED': '已报名',
    'CANCELLED': '已取消',
    'ATTENDED': '已参加'
  }
  return statusMap[status] || status
}

// 筛选活动
const filteredActivities = computed(() => {
  let filtered = activities.value
  
  // 关键词搜索
  if (searchKeyword.value) {
    filtered = filtered.filter(activity => 
      activity.title.includes(searchKeyword.value) ||
      activity.description.includes(searchKeyword.value)
    )
  }
  
  // 状态筛选
  if (statusFilter.value) {
    filtered = filtered.filter(activity => activity.status === statusFilter.value)
  }
  
  return filtered
})

// 初始化数据
onMounted(() => {
  console.log('=== 活动管理页面调试 ===')
  console.log('当前用户:', auth.user?.value) // 注意：使用 .value
  console.log('用户ID:', auth.user?.value?.id)
  console.log('用户名:', auth.user?.value?.username)
  console.log('用户类型:', auth.user?.value?.userType)
  console.log('是否为管理员:', auth.user?.value?.userType === 'ADMIN')
  
  if (auth.user?.value?.userType === 'ADMIN') {
    console.log('开始获取活动数据...')
    fetchActivities()
  } else {
    console.log('用户不是管理员，跳过数据获取')
  }
})
</script>

<style scoped>

/* 修复页面背景色 */
.page-container {
  background: white !important;
  background-color: white !important;
}

.admin-activity-management {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  font-family: 'Segoe UI', system-ui, sans-serif;
  min-height: 100vh;
  background: #f8fafc;  /* 添加与其他页面一致的背景色 */
}

/* 页面头部 */
.page-header {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.header-left h1 {
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-secondary, .btn-primary {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-secondary {
  background: var(--brand-highlight);
  color: #222;
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: #f3db60;
}

.btn-primary {
  background: var(--brand-primary);
  color: white;
}

.btn-primary:hover {
  background: #6aa3d6;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  border: 1px solid var(--border);
  text-align: center;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: var(--brand-primary);
  margin-bottom: 6px;
}

.stat-label {
  color: var(--text-muted);
  font-size: 14px;
}

/* 筛选卡片 */
.filter-card {
  background: white;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  border: 1px solid var(--border);
}

.filter-section {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 10px 12px;
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

.filter-select {
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 14px;
  background: white;
  min-width: 140px;
  cursor: pointer;
}

/* 活动表格 */
.activities-table {
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  border: 1px solid var(--border);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

th {
  background: #fafafa;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
}

.activity-title {
  font-weight: 600;
  color: var(--text-primary);
}

/* 操作按钮 */
.actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.actions button {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
}

.btn-view { background: var(--brand-primary); color: white; }
.btn-edit { background: #e6a23c; color: white; }
.btn-publish { background: #52c41a; color: white; }
.btn-cancel { background: #f56c6c; color: white; }
.btn-complete { background: #909399; color: white; }
.btn-delete { background: #f56c6c; color: white; }

.actions button:hover {
  opacity: 0.9;
}

/* 状态徽章 */
.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.status-draft { background: #f0f0f0; color: #666; }
.status-published { background: var(--brand-accent); color: var(--brand-primary); }
.status-cancelled { background: #fef0f0; color: #f56c6c; }
.status-completed { background: #f6ffed; color: #52c41a; }
.status-registered { background: var(--brand-accent); color: var(--brand-primary); }
.status-attended { background: #f6ffed; color: #52c41a; }

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
  background: white;
  border-radius: 6px;
  border: 1px solid var(--border);
  margin-top: 20px;
}

.empty-state p {
  margin: 0 0 16px 0;
  font-size: 15px;
}

/* 模态框样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 6px;
  width: 600px;
  max-width: 90vw;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-muted);
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f8f9fa;
  border-radius: 4px;
}

.modal-body {
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.registrations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.registration-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
  border: 1px solid var(--border);
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
}

.registration-time {
  color: var(--text-muted);
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-activity-management {
    padding: 16px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .btn-secondary, .btn-primary {
    flex: 1;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-select {
    width: 100%;
  }
  
  table {
    display: block;
    overflow-x: auto;
  }
  
  .actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .actions button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .admin-activity-management {
    padding: 12px;
  }
  
  .header-left h1 {
    font-size: 20px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .stat-number {
    font-size: 24px;
  }
  
  th, td {
    padding: 8px 12px;
    font-size: 13px;
  }
}
</style>