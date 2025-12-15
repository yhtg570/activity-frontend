<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-header-content">
        <div class="page-header-left">
          <h1>校园活动</h1>
          <p class="page-header-subtitle">探索校园精彩活动，参与丰富校园生活</p>
        </div>
        <div class="page-header-actions">
          <div class="btn-group">
            <router-link to="/my-registrations" class="btn btn-secondary" v-if="auth.user">
              我的报名
            </router-link>
            <button 
              v-if="auth.user?.userType === 'ADMIN'" 
              @click="$router.push('/admin/activities')" 
              class="btn btn-warning"
            >
              活动管理
            </button>
            <button 
              v-if="auth.user?.userType === 'ADMIN'" 
              @click="$router.push('/activities/create')" 
              class="btn btn-primary"
            >
              发布活动
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选卡片 -->
    <div class="filter-card">
      <div class="filter-section">
        <div class="search-box">
          <input
            v-model="searchKeyword"
            placeholder="搜索活动名称、描述..."
            class="search-input"
          >
        </div>
        <div class="filter-options">
          <select v-model="statusFilter" class="filter-select">
            <option value="">全部状态</option>
            <option value="PUBLISHED">报名中</option>
            <option value="CANCELLED">已取消</option>
            <option value="COMPLETED">已结束</option>
          </select>
          <div class="stats-badge">
            共 {{ filteredActivities.length }} 个活动
          </div>
        </div>
      </div>
    </div>

    <!-- 活动列表 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载活动数据...</p>
    </div>

    <div v-else-if="filteredActivities.length === 0" class="empty-state">
      <div class="empty-illustration"></div>
      <h3>暂无活动</h3>
      <p>暂时没有找到符合条件的学生活动</p>
      <button 
        v-if="auth.user?.userType === 'ADMIN'" 
        @click="$router.push('/activities/create')" 
        class="btn-primary"
      >
        发布第一个活动
      </button>
      <button 
        v-else 
        @click="$router.push('/dashboard')" 
        class="btn-secondary"
      >
        返回首页
      </button>
    </div>

    <div v-else class="activities-container">
      <div class="activities-grid">
        <div v-for="activity in filteredActivities" :key="activity.id" class="activity-card">
          <div class="activity-info">
            <div class="activity-header">
              <h3 class="activity-title">{{ activity.title }}</h3>
            </div>
            
            <p class="activity-description">{{ activity.description }}</p>
            
            <div class="activity-details">
              <div class="detail-item">
                <span class="detail-label">时间：</span>
                <span>{{ formatDateTime(activity.startTime) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">地点：</span>
                <span>{{ activity.location }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">组织单位：</span>
                <span>{{ activity.organizer }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">参与人数：</span>
                <span>{{ activity.currentParticipants }}/{{ activity.maxParticipants || '不限' }}</span>
              </div>
            </div>
          </div>

          <div class="registration-info">
            <div class="registration-meta">
              <div class="meta-item">
                <span class="meta-label">活动状态：</span>
                <span :class="['status-indicator', getStatusClass(activity.status)]">
                  {{ getStatusText(activity.status) }}
                </span>
              </div>
            </div>

            <div class="registration-actions">
              <button 
                v-if="auth.user && activity.status === 'PUBLISHED'"
                @click="handleRegister(activity.id)"
                :disabled="isRegistered(activity.id) || isActivityFull(activity)"
                :class="['btn-register', {
                  'registered': isRegistered(activity.id),
                  'full': isActivityFull(activity)
                }]"
              >
                {{ getRegisterButtonText(activity) }}
              </button>
              
              <button 
                @click="viewActivityDetails(activity.id)"
                class="btn-view"
              >
                查看详情
              </button>

              <div class="admin-actions" v-if="auth.user?.userType === 'ADMIN'">
                <button 
                  @click="handleEdit(activity.id)"
                  class="btn-edit"
                >
                  编辑
                </button>
                
                <button 
                  @click="deleteActivity(activity.id)"
                  class="btn-delete"
                >
                  删除
                </button>
              </div>
            </div>

          <!-- 修改后的评论预览：更低调，只显示一条 -->
          <div v-if="reviewsByActivity[activity.id] && reviewsByActivity[activity.id].length" 
               class="reviews-preview-minimal">
            <div class="preview-header">
              <span class="preview-label">最新评价</span>
              <span class="preview-count">{{ reviewsByActivity[activity.id].length }}条</span>
            </div>
            <div class="preview-content">
              <div class="preview-item">
                <div class="preview-meta">
                  <span class="preview-user">{{ reviewsByActivity[activity.id][0].username || '匿名用户' }}</span>
                  <span v-if="reviewsByActivity[activity.id][0].rating" class="preview-rating">
                    <span class="star-icon">★</span>
                    {{ reviewsByActivity[activity.id][0].rating }}分
                  </span>
                </div>
                <div class="preview-comment">{{ 
                  reviewsByActivity[activity.id][0].comment.length > 25 
                    ? reviewsByActivity[activity.id][0].comment.substring(0, 25) + '...' 
                    : reviewsByActivity[activity.id][0].comment 
                }}</div>
                <button 
                  @click="viewActivityDetails(activity.id)" 
                  class="preview-view-details"
                >
                  更多评价
                </button>
              </div>
            </div>
          </div>
          
          <!-- 如果没有评论，显示简洁的提示 -->
          <div v-else class="no-reviews-minimal">
            <span>暂无评价</span>
            <button 
              @click="viewActivityDetails(activity.id)" 
              class="btn-add-review"
            >
              去评价
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
    <!-- 底部加载提示 -->
    <div v-if="!loading && filteredActivities.length > 0" class="list-footer">
      <p>已显示全部活动，共 {{ filteredActivities.length }} 个</p>
    </div>
  </div>
  <teleport to="body">
  <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ selectedActivity?.title }}</h3>
        <button class="close-btn" @click="showDetailModal = false">×</button>
      </div>
      
      <div class="modal-body">
        <!-- 活动基本信息 -->
        <div class="activity-info-section">
          <p><strong>活动介绍：</strong>{{ selectedActivity?.description }}</p>
          <p><strong>时间：</strong>{{ formatDateTime(selectedActivity?.startTime) }}</p>
          <p><strong>地点：</strong>{{ selectedActivity?.location }}</p>
          <p><strong>组织单位：</strong>{{ selectedActivity?.organizer }}</p>
          <p><strong>参与人数：</strong>{{ selectedActivity?.currentParticipants }}/{{ selectedActivity?.maxParticipants || '不限' }}</p>
          <p><strong>状态：</strong>{{ getStatusText(selectedActivity?.status) }}</p>
        </div>
        
        <!-- 评论提交区域 -->
        <div v-if="auth.user" class="review-form-section">
          <h4>发表评价</h4>
          <div class="rating-input">
            <span>评分：</span>
            <div class="stars">
              <span 
                v-for="star in 5" 
                :key="star" 
                class="star"
                :class="{ 'filled': star <= newReview.rating }"
                @click="setRating(star)"
                @mouseover="hoverRating = star"
                @mouseleave="hoverRating = 0"
              >
                ★
              </span>
            </div>
          </div>
          <textarea 
            v-model="newReview.comment" 
            placeholder="请输入您的评价..." 
            class="review-textarea"
            rows="3"
          ></textarea>
          <button @click="submitReview" class="btn-submit-review" :disabled="!newReview.comment.trim()">
            提交评价
          </button>
        </div>
        <div v-else class="login-prompt">
          <p>请先<a href="/login" @click.prevent="$router.push('/login')">登录</a>后发表评价</p>
        </div>
        
        <!-- 评论列表 -->
        <div class="reviews-section">
          <h4>所有评价（{{ selectedActivityReviews.length }}）</h4>
          <div v-if="selectedActivityReviews.length === 0" class="no-reviews">
            暂无评价
          </div>
          <div v-else class="review-list">
            <div v-for="review in selectedActivityReviews" :key="review.id" class="review-item">
              <div class="review-header">
                <strong>{{ review.username || '匿名用户' }}</strong>
                <div v-if="review.rating" class="review-stars">
                  <span v-for="n in 5" :key="n" :class="['star', n <= review.rating ? 'filled' : '']">★</span>
                </div>
              </div>
              <div class="review-body">{{ review.comment }}</div>
              <div class="review-footer">
                {{ formatDateTime(review.createdAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="showDetailModal = false" class="btn-secondary">关闭</button>
      </div>
    </div>
  </div>
</teleport>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import axios from 'axios'

const router = useRouter()
const auth = useAuth()

const activities = ref([])
const userRegistrations = ref([])
const reviewsByActivity = ref({})
const searchKeyword = ref('')
const statusFilter = ref('')
const loading = ref(false)
const selectedActivity = ref(null)
const showDetailModal = ref(false)
const selectedActivityReviews = ref([])
const hoverRating = ref(0)

// 新增评论表单
const newReview = reactive({
  rating: 0,
  comment: ''
})

// 查看活动详情（现在加载评论）
const viewActivityDetails = async (activityId) => {
  console.log('查看活动详情:', activityId)
  const activity = activities.value.find(a => a.id === activityId)
  if (activity) {
    selectedActivity.value = activity
    showDetailModal.value = true
    
    // 加载该活动的所有评论
    try {
      const response = await axios.get(`/api/activities/${activityId}/reviews`)
      selectedActivityReviews.value = response.data || []
    } catch (error) {
      console.error('加载评论失败:', error)
      selectedActivityReviews.value = []
    }
    
    // 重置新评论表单
    newReview.rating = 0
    newReview.comment = ''
  }
}

// 设置评分
const setRating = (rating) => {
  newReview.rating = rating
}

// 提交评论
const submitReview = async () => {
  if (!auth.user.value) {
    alert('请先登录')
    router.push('/login')
    return
  }
  
  if (!newReview.comment.trim()) {
    alert('请输入评价内容')
    return
  }
  
  try {
    const payload = {
      userId: auth.user.value.id,
      username: auth.user.value.username,
      comment: newReview.comment.trim(),
      rating: newReview.rating || null
    }
    
    const response = await axios.post(`/api/activities/${selectedActivity.value.id}/reviews`, payload)
    
    if (response.data && response.data.success) {
      alert('评价提交成功！')
      
      // 刷新评论列表
      const res = await axios.get(`/api/activities/${selectedActivity.value.id}/reviews`)
      selectedActivityReviews.value = res.data || []
      
      // 重置表单
      newReview.rating = 0
      newReview.comment = ''
    } else {
      alert('提交失败: ' + (response.data?.message || '未知原因'))
    }
  } catch (error) {
    console.error('提交评价失败:', error)
    alert('提交失败: ' + (error.response?.data?.message || error.message))
  }
}




// 获取活动列表
const fetchActivities = async () => {
  loading.value = true
  try {
    console.log('开始获取活动列表...')
    console.log('当前用户类型:', auth.user.value?.userType)
    
    // 根据用户角色选择不同的接口
    if (auth.user.value?.userType === 'ADMIN') {
      // 管理员：获取所有活动（包括草稿）
      const response = await axios.get('/api/activities')
      activities.value = response.data
      console.log('管理员获取到所有活动数量:', activities.value.length)
    } else {
      // 普通用户：只获取已发布的活动
      const response = await axios.get('/api/activities/published')
      activities.value = response.data
      console.log('普通用户获取到已发布活动数量:', activities.value.length)
    }
    
    // 并行请求每个活动的最新评论（只取前三条）
    const ids = activities.value.map(a => a.id)
    await Promise.all(ids.map(id => fetchReviewsFor(id)))
  } catch (error) {
    console.error('获取活动列表失败:', error)
    alert('获取活动列表失败')
  } finally {
    loading.value = false
  }
}

// 获取用户报名记录
const fetchUserRegistrations = async () => {
  if (!auth.user.value) {
    console.log('用户未登录，跳过获取报名记录')
    return
  }
  
  try {
    console.log('获取用户报名记录，用户ID:', auth.user.value.id)
    const response = await axios.get(`/api/registrations/user/${auth.user.value.id}`)
    userRegistrations.value = response.data
    console.log('获取到报名记录数量:', userRegistrations.value.length)
  } catch (error) {
    console.error('获取报名记录失败:', error)
    userRegistrations.value = []
  }
}

// 报名活动
const handleRegister = async (activityId) => {
  if (!auth.user.value) {
    alert('请先登录')
    router.push('/login')
    return
  }

  console.log('开始报名，活动ID:', activityId, '用户ID:', auth.user.value.id)

  if (!confirm('确定要报名这个活动吗？')) return

  try {
    const response = await axios.post('/api/registrations', {
      activityId: activityId,
      userId: auth.user.value.id,
      notes: ''
    })
    
    console.log('报名响应:', response)
    
    if (response.status === 200) {
      alert('报名成功！')
      await fetchActivities()
      await fetchUserRegistrations()
    }
  } catch (error) {
    console.error('报名错误详情:', error)
    const errorMessage = error.response?.data || error.message || '报名失败'
    alert('报名失败: ' + errorMessage)
  }
}

// 检查是否已报名
const isRegistered = (activityId) => {
  const registered = userRegistrations.value.some(reg => 
    reg.activityId === activityId && reg.status === 'REGISTERED'
  )
  return registered
}

// 检查活动是否已满
const isActivityFull = (activity) => {
  const isFull = activity.maxParticipants > 0 && activity.currentParticipants >= activity.maxParticipants
  return isFull
}

// 获取指定活动的最新评论
const fetchReviewsFor = async (activityId) => {
  try {
    const res = await axios.get(`/api/activities/${activityId}/reviews`)
    if (res && res.data) {
      reviewsByActivity.value[activityId] = res.data.slice(0, 3)
    } else {
      reviewsByActivity.value[activityId] = []
    }
  } catch (err) {
    console.error('获取评论失败 for', activityId, err)
    reviewsByActivity.value[activityId] = []
  }
}

// 获取报名按钮文本
const getRegisterButtonText = (activity) => {
  if (activity.status !== 'PUBLISHED') {
    return '已结束'
  } else if (isRegistered(activity.id)) {
    return '已报名'
  } else if (isActivityFull(activity)) {
    return '已满员'
  } else {
    return '立即报名'
  }
}

// 编辑活动
const handleEdit = (activityId) => {
  console.log('编辑活动ID:', activityId)
  router.push(`/dashboard/activities/edit/${activityId}`)
    .then(() => {
      console.log('跳转成功')
    })
    .catch((error) => {
      console.error('跳转失败:', error)
      alert('跳转失败: ' + error.message)
    })
}

// 删除活动
const deleteActivity = async (activityId) => {
  if (!confirm('确定要删除这个活动吗？')) return
  
  try {
    await axios.delete(`/api/activities/${activityId}`)
    alert('删除成功')
    await fetchActivities()
  } catch (error) {
    console.error('删除活动失败:', error)
    alert('删除失败')
  }
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  const date = new Date(dateTime)
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取状态样式
const getStatusClass = (status) => {
  const statusMap = {
    'PUBLISHED': 'status-published',
    'CANCELLED': 'status-cancelled',
    'COMPLETED': 'status-completed',
    'DRAFT': 'status-draft'
  }
  return statusMap[status] || 'status-draft'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'PUBLISHED': '报名中',
    'CANCELLED': '已取消',
    'COMPLETED': '已结束',
    'DRAFT': '草稿'
  }
  return statusMap[status] || status
}

// 筛选活动
const filteredActivities = computed(() => {
  let filtered = activities.value
  
  // 管理员可以看到所有状态的活动，普通用户只能看到PUBLISHED、CANCELLED、COMPLETED
  if (auth.user.value?.userType !== 'ADMIN') {
    filtered = filtered.filter(activity => 
      activity.status === 'PUBLISHED' || 
      activity.status === 'CANCELLED' || 
      activity.status === 'COMPLETED'
    )
  }
  
  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(activity => 
      activity.title.toLowerCase().includes(keyword) ||
      activity.description.toLowerCase().includes(keyword) ||
      activity.organizer.toLowerCase().includes(keyword)
    )
  }
  
  // 状态筛选
  if (statusFilter.value) {
    filtered = filtered.filter(activity => activity.status === statusFilter.value)
  }
  
  return filtered
})

// 初始化数据
onMounted(async () => {
  console.log('ActivityList 组件挂载，用户:', auth.user.value)
  await fetchActivities()
  if (auth.user.value) {
    await fetchUserRegistrations()
  }
})
</script>

<style scoped>

/* 修复页面背景色 */
.page-container {
  background: white !important;
  background-color: white !important;
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

/* 按钮样式 */
.btn-primary, .btn-secondary, .btn-admin {
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

.btn-admin {
  background: #e6a23c;
  color: white;
}

.btn-admin:hover {
  background: #d4880c;
}

/* 筛选卡片 */
.filter-card {
  background: white;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  border: 1px solid var(--border);
}

.filter-section {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.search-box {
  flex: 1;
}

.search-input {
  width: 100%;
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

.filter-options {
  display: flex;
  align-items: center;
  gap: 16px;
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

.stats-badge {
  color: var(--text-muted);
  font-size: 13px;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-muted);
}

.loading-spinner {
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

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  border: 1px solid var(--border);
}

.empty-illustration {
  height: 40px;
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-state h3 {
  color: var(--text-primary);
  margin: 0 0 10px 0;
  font-size: 18px;
}

.empty-state p {
  color: var(--text-muted);
  margin: 0 0 24px 0;
  font-size: 15px;
}

/* 活动容器 */
.activities-container {
  max-width: 1000px;
  margin: 0 auto;
}

.activities-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 活动卡片 */
.activity-card {
  background: white;
  border-radius: 6px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  border: 1px solid var(--border);
  transition: all 0.2s ease;
  position: relative;
}

.activity-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

/* 状态徽章 */
.status-badge {
  position: absolute;
  top: 12px;
  right: -20px;
  padding: 4px 24px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  transform: rotate(45deg);
  text-align: center;
  width: 80px;
}

.status-published {
  background: #52c41a;
}

.status-cancelled {
  background: #f56c6c;
}

.status-completed {
  background: #909399;
}

.status-draft {
  background: #e6a23c;
}

.activity-info {
  border-right: 1px solid var(--border);
  padding-right: 24px;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.activity-title {
  margin: 0;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
  flex: 1;
}

.activity-description {
  color: var(--text-muted);
  margin-bottom: 20px;
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

/* 报名信息 */
.registration-info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.registration-meta {
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 13px;
}

.meta-label {
  color: var(--text-muted);
}

.status-indicator {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-published {
  background: var(--brand-accent);
  color: var(--brand-primary);
  border: 1px solid var(--brand-primary);
}

.status-cancelled {
  background: #fef0f0;
  color: #f56c6c;
  border: 1px solid #f56c6c;
}

.status-completed {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #52c41a;
}

.status-draft {
  background: #f0f0f0;
  color: #666;
  border: 1px solid #ddd;
}

.registration-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.btn-register, .btn-view, .btn-edit, .btn-delete {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  width: 100%;
}

.btn-register {
  background: var(--brand-primary);
  color: white;
}

.btn-register:hover:not(:disabled) {
  background: #6aa3d6;
}

.btn-register:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-register.registered {
  background: #52c41a;
}

.btn-register.full {
  background: #f56c6c;
}

.btn-view {
  background: #909399;
  color: white;
  border: 1px solid var(--border);
}

.btn-view:hover {
  background: #a6a9ad;
}

.admin-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.btn-edit {
  background: #e6a23c;
  color: white;
  flex: 1;
}

.btn-edit:hover {
  background: #d4880c;
}

.btn-delete {
  background: #f56c6c;
  color: white;
  flex: 1;
}

.btn-delete:hover {
  background: #d9363e;
}
/* 评论相关新样式 */
.review-form-section {
  margin: 20px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid var(--brand-primary);
}

.review-form-section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: var(--text-primary);
}

.rating-input {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 24px;
  color: #ddd;
  cursor: pointer;
  transition: color 0.2s;
}

.star:hover {
  color: #ffc107;
}

.star.filled {
  color: #ffc107;
}

.review-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 15px;
  resize: vertical;
}

.review-textarea:focus {
  outline: none;
  border-color: var(--brand-primary);
}

.btn-submit-review {
  background: var(--brand-primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.btn-submit-review:hover:not(:disabled) {
  background: #6aa3d6;
}

.btn-submit-review:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-prompt {
  text-align: center;
  padding: 20px;
  color: var(--text-muted);
}

.login-prompt a {
  color: var(--brand-primary);
  text-decoration: none;
}

.login-prompt a:hover {
  text-decoration: underline;
}

.reviews-section {
  margin-top: 30px;
}

.reviews-section h4 {
  margin-bottom: 15px;
  color: var(--text-primary);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

.no-reviews {
  text-align: center;
  padding: 30px;
  color: var(--text-muted);
  font-style: italic;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.review-item {
  background: white;
  border-radius: 6px;
  padding: 15px;
  border: 1px solid var(--border);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.review-stars {
  display: flex;
  gap: 1px;
}

.review-stars .star {
  font-size: 16px;
  color: #ddd;
}

.review-stars .star.filled {
  color: #ffc107;
}

.review-body {
  color: var(--text-primary);
  line-height: 1.5;
  margin-bottom: 10px;
}

.review-footer {
  text-align: right;
  font-size: 12px;
  color: var(--text-muted);
}

.reviews-preview {
  margin-top: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid var(--brand-primary);
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.reviews-header span {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 14px;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.review-item {
  background: white;
  border-radius: 4px;
  padding: 12px;
  border: 1px solid #e0e0e0;
}

.review-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.reviewer {
  color: var(--text-primary);
  font-size: 13px;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.rating-stars .star {
  font-size: 12px;
  color: #ddd;
}

.rating-stars .star.filled {
  color: #ffc107;
}

.review-comment {
  color: var(--text-primary);
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.review-time {
  text-align: right;
  font-size: 11px;
  color: var(--text-muted);
}

/* "查看更多评价"按钮样式 */
.btn-more-reviews {
  display: block;
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  color: var(--brand-primary);
  border: 1px solid var(--brand-primary);
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  transition: all 0.2s ease;
}

.btn-more-reviews:hover {
  background: var(--brand-primary);
  color: white;
}

.btn-more-reviews:active {
  transform: translateY(1px);
}

/* 模态框中的查看更多按钮（如果有） */
.btn-view-more {
  margin-top: 10px;
  padding: 8px 16px;
  background: var(--brand-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-view-more:hover {
  background: #6aa3d6;
}

.activity-info-section {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}

.activity-info-section p {
  margin-bottom: 8px;
}

/* 列表底部 */
.list-footer {
  text-align: center;
  padding: 20px;
  color: var(--text-muted);
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .activity-list {
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
  
  .action-buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  
  .btn-secondary, .btn-admin, .btn-primary {
    flex: 1;
    min-width: 120px;
    text-align: center;
  }
  
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-select {
    min-width: 100%;
  }
  
  .activity-card {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .activity-info {
    border-right: none;
    border-bottom: 1px solid var(--border);
    padding-right: 0;
    padding-bottom: 20px;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .detail-label {
    min-width: auto;
  }
  
  .meta-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
  
  .admin-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .activity-list {
    padding: 12px;
  }
  
  .page-header h1 {
    font-size: 20px;
  }
  
  .filter-card {
    padding: 16px;
  }
  
  .activity-card {
    padding: 20px;
  }
  
  .activity-title {
    font-size: 16px;
  }
  
  .activity-description {
    font-size: 13px;
  }
  
  .status-badge {
    font-size: 10px;
    padding: 3px 20px;
    right: -18px;
    width: 70px;
  }
}
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

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  text-align: right;
}
/* 新的简约风格评论预览 */
.reviews-preview-minimal {
  margin-top: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
  font-size: 12px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f0f0f0;
}

.preview-label {
  color: #666;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.preview-count {
  background: #e8e8e8;
  color: #666;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
}

.preview-content {
  position: relative;
}

.preview-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}

.preview-user {
  color: #333;
  font-size: 11px;
  font-weight: 500;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-rating {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #faad14;
  font-size: 11px;
  font-weight: 600;
}

.star-icon {
  color: #faad14;
  font-size: 10px;
}

.preview-comment {
  color: #666;
  font-size: 11px;
  line-height: 1.4;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.preview-view-details {
  align-self: flex-start;
  background: none;
  border: none;
  color: #1890ff;
  font-size: 11px;
  padding: 2px 4px;
  cursor: pointer;
  transition: color 0.2s;
}

.preview-view-details:hover {
  color: #40a9ff;
  text-decoration: underline;
}

/* 没有评论时的简约提示 */
.no-reviews-minimal {
  margin-top: 16px;
  padding: 10px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px dashed #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.no-reviews-minimal span {
  font-size: 11px;
}

.btn-add-review {
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
  color: #666;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add-review:hover {
  background: #e8e8e8;
  border-color: #bfbfbf;
}

/* ========== 调整模态框中评论部分的样式 ========== */
/* 让模态框中的评论部分也更紧凑一些 */

.review-form-section {
  margin: 16px 0;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.review-form-section h4 {
  font-size: 14px;
  margin-bottom: 12px;
  color: #333;
}

.rating-input {
  margin-bottom: 12px;
}

.rating-input span {
  font-size: 12px;
  color: #666;
}

.stars {
  display: inline-flex;
  gap: 4px;
  margin-left: 8px;
}

.stars .star {
  font-size: 18px;
  color: #e8e8e8;
  cursor: pointer;
  transition: color 0.2s;
}

.stars .star.filled {
  color: #faad14;
}

.review-textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  margin-bottom: 12px;
  resize: vertical;
  min-height: 60px;
}

.btn-submit-review {
  padding: 6px 16px;
  font-size: 13px;
}

.reviews-section {
  margin-top: 20px;
}

.reviews-section h4 {
  font-size: 14px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.review-item {
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  margin-bottom: 8px;
  background: #fafafa;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.review-header strong {
  font-size: 13px;
}

.review-stars {
  display: flex;
  gap: 2px;
}

.review-stars .star {
  font-size: 12px;
  color: #e8e8e8;
}

.review-stars .star.filled {
  color: #faad14;
}

.review-body {
  font-size: 13px;
  color: #333;
  line-height: 1.5;
  margin-bottom: 6px;
}

.review-footer {
  font-size: 11px;
  color: #999;
  text-align: right;
}

/* ========== 响应式调整 ========== */
@media (max-width: 768px) {
  .reviews-preview-minimal {
    padding: 8px;
    margin-top: 12px;
  }
  
  .no-reviews-minimal {
    padding: 8px;
    margin-top: 12px;
  }
}
</style>