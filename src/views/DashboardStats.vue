<template>
  <div class="dashboard-stats">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-header-content">
        <div class="page-header-left">
          <h1>数据统计</h1>
          <p class="page-header-subtitle">系统运行数据与统计分析</p>
        </div>
        <div class="page-header-actions">
          <button @click="refreshStats" class="btn btn-primary">
            刷新数据
          </button>
          <button @click="exportData" class="btn btn-secondary">
            导出数据
          </button>
        </div>
      </div>
    </div>

    <!-- 统计概览卡片 -->
    <div class="stats-overview">
      <div class="stats-card">
        <div class="stats-icon icon-activity"></div>
        <div class="stats-content">
          <div class="stats-value">{{ overview.totalActivities || 0 }}</div>
          <div class="stats-label">活动总数</div>
        </div>
        <div class="stats-trend">
          <span class="trend-up">+{{ overview.weeklyActivities || 0 }} 本周</span>
        </div>
      </div>
      
      <div class="stats-card">
        <div class="stats-icon icon-user"></div>
        <div class="stats-content">
          <div class="stats-value">{{ overview.totalUsers || 0 }}</div>
          <div class="stats-label">用户总数</div>
        </div>
        <div class="stats-trend">
          <span class="trend-up">+{{ overview.weeklyUsers || 0 }} 本周</span>
        </div>
      </div>
      
      <div class="stats-card">
        <div class="stats-icon icon-registration"></div>
        <div class="stats-content">
          <div class="stats-value">{{ overview.totalRegistrations || 0 }}</div>
          <div class="stats-label">报名总数</div>
        </div>
        <div class="stats-trend">
          <span class="trend-info">{{ overview.avgRegistrationsPerActivity || 0 }} 平均/活动</span>
        </div>
      </div>
      
      <div class="stats-card">
        <div class="stats-icon icon-chart"></div>
        <div class="stats-content">
          <div class="stats-value">{{ overview.participationRate || 0 }}%</div>
          <div class="stats-label">活动参与率</div>
        </div>
        <div class="stats-trend">
          <span class="trend-info">{{ overview.activeUsers || 0 }} 活跃用户</span>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <!-- 第一行：两个图表 -->
      <div class="chart-row">
        <div class="chart-card">
          <div class="chart-header">
            <h3>活动状态分布</h3>
            <div class="chart-legend">
              <span class="legend-item published"></span> 报名中
              <span class="legend-item completed"></span> 已结束
              <span class="legend-item cancelled"></span> 已取消
              <span class="legend-item draft"></span> 草稿
            </div>
          </div>
          <div class="chart-wrapper">
            <canvas ref="statusChart"></canvas>
          </div>
        </div>
        
        <div class="chart-card">
          <div class="chart-header">
            <h3>每月活动数量</h3>
          </div>
          <div class="chart-wrapper">
            <canvas ref="monthlyChart"></canvas>
          </div>
        </div>
      </div>
      
      <!-- 第二行：两个图表 -->
      <div class="chart-row">
        <div class="chart-card">
          <div class="chart-header">
            <h3>用户类型分布</h3>
          </div>
          <div class="chart-wrapper">
            <canvas ref="userTypeChart"></canvas>
          </div>
        </div>
        
        <div class="chart-card">
          <div class="chart-header">
            <h3>报名时段分布</h3>
          </div>
          <div class="chart-wrapper">
            <canvas ref="hourlyChart"></canvas>
          </div>
        </div>
      </div>
      
      <!-- 热门活动表格 -->
      <div class="table-card">
        <div class="chart-header">
          <h3>热门活动排行</h3>
          <div class="table-actions">
            <select v-model="popularLimit" @change="loadPopularActivities" class="limit-select">
              <option value="5">前5名</option>
              <option value="10">前10名</option>
              <option value="20">前20名</option>
            </select>
          </div>
        </div>
        <div class="table-wrapper">
          <table class="stats-table">
            <thead>
              <tr>
                <th>排名</th>
                <th>活动名称</th>
                <th>参与人数</th>
                <th>最大人数</th>
                <th>状态</th>
                <th>参与率</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(activity, index) in popularActivities" :key="activity.id">
                <td class="rank-cell">
                  <span :class="['rank-badge', getRankClass(index + 1)]">
                    {{ index + 1 }}
                  </span>
                </td>
                <td class="activity-name">{{ activity.title }}</td>
                <td class="participants">
                  <span class="participants-value">{{ activity.participants }}</span>
                </td>
                <td>
                  {{ activity.maxParticipants || '不限' }}
                </td>
                <td>
                  <span :class="['status-badge', getStatusClass(activity.status)]">
                    {{ getStatusText(activity.status) }}
                  </span>
                </td>
                <td>
                  <div class="participation-progress">
                    <div class="progress-bar">
                      <div 
                        class="progress-fill" 
                        :style="{ width: getParticipationPercent(activity) + '%' }"
                      ></div>
                    </div>
                    <span class="progress-text">{{ getParticipationPercent(activity) }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>正在加载统计数据...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Chart, registerables } from 'chart.js'
import axios from 'axios'

// 注册Chart.js组件
Chart.register(...registerables)

// 响应式数据
const overview = ref({})
const statusDistribution = ref({})
const monthlyActivities = ref({})
const userTypeDistribution = ref({})
const registrationStats = ref({})
const popularActivities = ref([])
const popularLimit = ref(5)
const loading = ref(false)

// 图表引用
const statusChart = ref(null)
const monthlyChart = ref(null)
const userTypeChart = ref(null)
const hourlyChart = ref(null)

// 图表实例
let statusChartInstance = null
let monthlyChartInstance = null
let userTypeChartInstance = null
let hourlyChartInstance = null

// 加载所有统计数据
const loadAllStats = async () => {
  loading.value = true
  try {
    // 并行加载所有数据
    const [
      overviewRes,
      statusRes,
      monthlyRes,
      userTypeRes,
      registrationRes,
      popularRes
    ] = await Promise.all([
      axios.get('/api/stats/overview'),
      axios.get('/api/stats/activity-status-distribution'),
      axios.get('/api/stats/monthly-activities'),
      axios.get('/api/stats/user-type-distribution'),
      axios.get('/api/stats/registration-stats'),
      axios.get(`/api/stats/popular-activities?limit=${popularLimit.value}`)
    ])
    
    overview.value = overviewRes.data || {}
    statusDistribution.value = statusRes.data || {}
    monthlyActivities.value = monthlyRes.data || {}
    userTypeDistribution.value = userTypeRes.data || {}
    registrationStats.value = registrationRes.data || {}
    popularActivities.value = popularRes.data?.popularActivities || []
    
    // 渲染图表
    renderCharts()
  } catch (error) {
    console.error('加载统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载热门活动
const loadPopularActivities = async () => {
  try {
    const response = await axios.get(`/api/stats/popular-activities?limit=${popularLimit.value}`)
    popularActivities.value = response.data?.popularActivities || []
  } catch (error) {
    console.error('加载热门活动失败:', error)
  }
}

// 渲染所有图表
const renderCharts = () => {
  // 销毁之前的图表实例
  destroyCharts()
  
  // 渲染活动状态分布饼图
  renderStatusChart()
  
  // 渲染每月活动数量柱状图
  renderMonthlyChart()
  
  // 渲染用户类型分布饼图
  renderUserTypeChart()
  
  // 渲染报名时段折线图
  renderHourlyChart()
}

// 销毁图表实例
const destroyCharts = () => {
  if (statusChartInstance) {
    statusChartInstance.destroy()
    statusChartInstance = null
  }
  if (monthlyChartInstance) {
    monthlyChartInstance.destroy()
    monthlyChartInstance = null
  }
  if (userTypeChartInstance) {
    userTypeChartInstance.destroy()
    userTypeChartInstance = null
  }
  if (hourlyChartInstance) {
    hourlyChartInstance.destroy()
    hourlyChartInstance = null
  }
}

// 渲染活动状态分布饼图
const renderStatusChart = () => {
  const ctx = statusChart.value?.getContext('2d')
  if (!ctx) return
  
  const data = {
    labels: ['报名中', '已结束', '已取消', '草稿'],
    datasets: [{
      data: [
        statusDistribution.value.PUBLISHED || 0,
        statusDistribution.value.COMPLETED || 0,
        statusDistribution.value.CANCELLED || 0,
        statusDistribution.value.DRAFT || 0
      ],
      backgroundColor: [
        '#a1da84', // 浅绿色 - 报名中
        '#6aadeb', // 浅蓝色 - 已结束
        '#ec8385', // 浅红色 - 已取消
        '#f3c873'  // 浅黄色 - 草稿
      ],
      borderWidth: 1
    }]
  }
  
  statusChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || ''
              const value = context.raw || 0
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0
              return `${label}: ${value} (${percentage}%)`
            }
          }
        }
      }
    }
  })
}

// 渲染每月活动数量柱状图
const renderMonthlyChart = () => {
  const ctx = monthlyChart.value?.getContext('2d')
  if (!ctx) return
  
  const months = Object.keys(monthlyActivities.value)
  const counts = Object.values(monthlyActivities.value)
  
  const data = {
    labels: months,
    datasets: [{
      label: '活动数量',
      data: counts,
      backgroundColor: '#6aadeb', // 使用浅蓝色
      borderColor: '#6aadeb',
      borderWidth: 1,
      borderRadius: 4
    }]
  }
  
  monthlyChartInstance = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  })
}

// 渲染用户类型分布饼图
const renderUserTypeChart = () => {
  const ctx = userTypeChart.value?.getContext('2d')
  if (!ctx) return
  
  const data = {
    labels: ['学生', '教师', '管理员'],
    datasets: [{
      data: [
        userTypeDistribution.value.STUDENT || 0,
        userTypeDistribution.value.TEACHER || 0,
        userTypeDistribution.value.ADMIN || 0
      ],
      backgroundColor: [
        '#a1da84', // 浅绿色 - 学生
        '#6aadeb', // 浅蓝色 - 教师
        '#f3c873'  // 浅黄色 - 管理员
      ],
      borderWidth: 1
    }]
  }
  
  userTypeChartInstance = new Chart(ctx, {
    type: 'pie',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  })
}

// 渲染报名时段折线图
const renderHourlyChart = () => {
  const ctx = hourlyChart.value?.getContext('2d')
  if (!ctx) return
  
  const hourlyData = registrationStats.value.hourlyRegistrations || {}
  const hours = Object.keys(hourlyData)
  const counts = Object.values(hourlyData)
  
  const data = {
    labels: hours,
    datasets: [{
      label: '报名数量',
      data: counts,
      backgroundColor: 'rgba(106, 173, 235, 0.1)', // 浅蓝色半透明
      borderColor: '#6aadeb', // 浅蓝色
      borderWidth: 2,
      tension: 0.4,
      fill: true
    }]
  }
  
  hourlyChartInstance = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  })
}

// 刷新数据
const refreshStats = () => {
  loadAllStats()
}

// 导出数据
const exportData = () => {
  alert('数据导出功能正在开发中...')
}

// 获取排名样式类
const getRankClass = (rank) => {
  if (rank === 1) return 'rank-gold'
  if (rank === 2) return 'rank-silver'
  if (rank === 3) return 'rank-bronze'
  return 'rank-normal'
}

// 获取状态样式类
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

// 获取参与率百分比
const getParticipationPercent = (activity) => {
  if (!activity.maxParticipants || activity.maxParticipants <= 0) return 100
  const percent = (activity.participants / activity.maxParticipants) * 100
  return Math.min(Math.round(percent), 100)
}

// 初始化
onMounted(() => {
  loadAllStats()
})

// 清理
onUnmounted(() => {
  destroyCharts()
})
</script>

<style scoped>
.dashboard-stats {
  padding: 20px;
}

/* 页面头部 */
.page-header {
  margin-bottom: 24px;
}

.page-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.page-header-left h1 {
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 6px 0;
}

.page-header-subtitle {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0;
}

.page-header-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
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

/* 统计概览卡片 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stats-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border);
  transition: transform 0.2s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.stats-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: var(--brand-accent);
  color: var(--brand-primary);
  flex-shrink: 0;
}

/* 统计卡片图标 - 颜色改为 #666 */
.stats-icon::before {
  content: '';
  display: block;
  width: 24px;
  height: 24px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.icon-activity::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M11 17c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1zm0-14v4h2V5.08c3.39.49 6 3.39 6 6.92 0 3.87-3.13 7-7 7s-7-3.13-7-7c0-1.68.59-3.22 1.58-4.42L12 13l1.41-1.41-6.8-6.8v.02C4.42 6.45 3 9.05 3 12c0 4.97 4.02 9 9 9s9-4.03 9-9c0-5.47-4.03-10-9-10h-1zm7 9c0-.55-.45-1-1-1s-1 .45-1 1 .45 1 1 1 1-.45 1-1z'/%3E%3C/svg%3E");
}

.icon-user::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E");
}

.icon-registration::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E");
}

.icon-chart::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z'/%3E%3C/svg%3E");
}

.stats-content {
  flex: 1;
}

.stats-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 4px;
}

.stats-label {
  font-size: 14px;
  color: var(--text-muted);
}

.stats-trend {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  background: #f6ffed;
  color: #74c44c;
}

.trend-up {
  color: #52c41a;
}

.trend-down {
  color: #ff4d4f;
}

.trend-info {
  color: #1890ff;
}

/* 图表容器 */
.charts-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.chart-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.chart-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 700;
}

.chart-legend {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--text-muted);
}

.legend-item {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 4px;
}

.legend-item.published {
  background: #a1da84;
}

.legend-item.completed {
  background: #6aadeb;
}

.legend-item.cancelled {
  background: #ec8385;
}

.legend-item.draft {
  background: #f3c873;
}

.chart-wrapper {
  position: relative;
  height: 300px;
}

/* 表格样式 */
.table-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border);
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.limit-select {
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 14px;
  background: white;
}

.table-wrapper {
  overflow-x: auto;
}

.stats-table {
  width: 100%;
  border-collapse: collapse;
}

.stats-table th {
  background: #fafafa;
  color: var(--text-muted);
  font-weight: 600;
  text-align: left;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
}

.stats-table td {
  padding: 16px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}

.stats-table tbody tr:hover {
  background: #fafafa;
}

.rank-cell {
  width: 60px;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
}

.rank-gold {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #8b6914;
}

.rank-silver {
  background: linear-gradient(135deg, #c0c0c0, #e0e0e0);
  color: #696969;
}

.rank-bronze {
  background: linear-gradient(135deg, #cd7f32, #e6a769);
  color: #8b4513;
}

.rank-normal {
  background: #f5f5f5;
  color: var(--text-muted);
}

.activity-name {
  font-weight: 500;
  color: var(--text-primary);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.participants-value {
  font-weight: 700;
  color: var(--brand-primary);
  font-size: 16px;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.status-published {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #52c41a;
}

.status-cancelled {
  background: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ff4d4f;
}

.status-completed {
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #1890ff;
}

.status-draft {
  background: #fafafa;
  color: #666;
  border: 1px solid #ddd;
}

.participation-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #52c41a, #1890ff);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: var(--text-muted);
  min-width: 40px;
}

/* 加载状态 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top: 3px solid var(--brand-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .chart-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .page-header-actions {
    width: 100%;
  }
  
  .btn {
    flex: 1;
  }
  
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .chart-row {
    gap: 16px;
  }
  
  .stats-table th,
  .stats-table td {
    padding: 12px 8px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .dashboard-stats {
    padding: 16px;
  }
  
  .chart-card,
  .table-card {
    padding: 16px;
  }
  
  .chart-wrapper {
    height: 250px;
  }
  
  .limit-select {
    width: 100%;
  }
}
</style>