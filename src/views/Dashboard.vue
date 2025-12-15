<template>
  <div class="dashboard-container">
    <!-- 顶部导航栏 -->
    <header class="dashboard-header">
      <div class="header-content">
        <div class="brand-section">
          <div class="brand-logo">
            <span class="logo-i">i</span>
            <span class="logo-campus">Campus</span>
          </div>
          <div class="brand-subtitle">校园活动管理系统</div>
        </div>
        
        <div class="user-section">
          <div class="user-info">
            <div class="avatar-circle">
              {{ getUserInitial(userData.realName || userData.username) }}
            </div>
            <div class="user-details">
              <div class="user-name">{{ userData.realName || userData.username }}</div>
              <div class="user-role">{{ getUserRoleText(userData.userType) }}</div>
            </div>
            <div class="user-menu">
              <button @click="toggleDropdown" class="menu-toggle">
                <div class="menu-icon">▼</div>
              </button>
              <div v-if="showDropdown" class="dropdown-menu">
                <router-link to="/profile" class="dropdown-item">
                  <span class="item-icon icon-user"></span>
                  个人资料
                </router-link>
                <button @click="handleLogout" class="dropdown-item">
                  <span class="item-icon icon-logout"></span>
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="dashboard-main">
      <!-- 左侧导航栏 -->
      <nav class="sidebar">
        <div class="nav-groups">
          <div class="nav-group">
            <router-link 
              to="/dashboard" 
              class="nav-link" 
              :class="{ 'active': isHomePage }" 
              exact
            >
              <span class="nav-icon icon-home"></span>
              <span class="nav-text">首页</span>
            </router-link>
          </div>
          <div class="nav-group">
            <div class="group-title">主要功能</div>
            <router-link 
              to="/dashboard/activities" 
              class="nav-link" 
              :class="{ 'active': $route.path === '/dashboard/activities' }" 
              exact
            >
              <span class="nav-icon icon-activity"></span>
              <span class="nav-text">活动列表</span>
            </router-link>
            <router-link 
              to="/dashboard/my-registrations" 
              class="nav-link" 
              :class="{ 'active': $route.path === '/dashboard/my-registrations' }" 
              exact
            >
              <span class="nav-icon icon-register"></span>
              <span class="nav-text">我的报名</span>
            </router-link>
            <router-link to="/dashboard/profile" class="nav-link" :class="{ 'active': $route.path === '/dashboard/profile' }">
              <span class="nav-icon icon-user"></span>
              <span class="nav-text">个人资料</span>
            </router-link>
          </div>
          
          <div v-if="isAdmin" class="nav-group">
            <div class="group-title">管理功能</div>
            <router-link to="/dashboard/admin/activities" class="nav-link" :class="{ 'active': $route.path === '/dashboard/admin/activities' }">
              <span class="nav-icon icon-admin"></span>
              <span class="nav-text">活动管理</span>
            </router-link>
            <router-link 
              to="/dashboard/activities/create" 
              class="nav-link" 
              :class="{ 'active': $route.path === '/dashboard/activities/create' }" 
              exact
            >
              <span class="nav-icon icon-create"></span>
              <span class="nav-text">发布活动</span>
            </router-link>
          </div>
          <div class="nav-group">
            <div class="group-title">数据分析</div>
            <router-link 
              to="/dashboard/stats" 
              class="nav-link" 
              :class="{ 'active': $route.path === '/dashboard/stats' }"
            >
              <span class="nav-icon icon-chart"></span>
              <span class="nav-text">数据统计</span>
            </router-link>
          </div>
        </div>
      </nav>

      <!-- 右侧内容区域 -->
      <div class="content-wrapper">
        <!-- 面包屑导航 - 只在非首页显示 -->
        <div class="breadcrumb" v-if="!isHomePage">
          <router-link to="/dashboard" class="breadcrumb-item">
            首页
          </router-link>
          <div class="breadcrumb-separator">/</div>
          <div class="breadcrumb-current">{{ currentPageTitle }}</div>
        </div>
        
        <!-- 路由内容区域 -->
        <div class="router-content">
          <router-view></router-view>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { ref, computed, onMounted, onUnmounted } from 'vue'

const router = useRouter()
const route = useRoute()
const auth = useAuth()

// 响应式数据
const showDropdown = ref(false)

// 计算属性
const userData = computed(() => {
  return auth.user?._value || auth.user?._rawValue || auth.user || {}
})

const isAdmin = computed(() => {
  return userData.value.userType === 'ADMIN'
})

const isHomePage = computed(() => {
  return route.path === '/dashboard' || route.path === '/dashboard/'
})

const currentPageTitle = computed(() => {
  const path = route.path
  if (path === '/dashboard' || path === '/dashboard/') return '控制台'
  if (path.includes('activities') && !path.includes('admin')) return '活动列表'
  if (path.includes('my-registrations')) return '我的报名'
  if (path.includes('profile')) return '个人资料'
  if (path.includes('admin/activities')) return '活动管理'
  if (path.includes('activities/create')) return '发布活动'
  if (path.includes('stats')) return '数据统计'
  return '控制台'
})

// 方法
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}

const getUserInitial = (name) => {
  return name ? name.charAt(0).toUpperCase() : 'U'
}

const getUserRoleText = (userType) => {
  const roles = {
    'STUDENT': '学生用户',
    'TEACHER': '教职工用户',
    'ADMIN': '管理员用户'
  }
  return roles[userType] || '普通用户'
}

// 生命周期
onMounted(() => {
  // 点击外部关闭下拉菜单
  const closeDropdown = (e) => {
    if (!e.target.closest('.user-menu')) {
      showDropdown.value = false
    }
  }
  
  document.addEventListener('click', closeDropdown)
  
  // 清理
  onUnmounted(() => {
    document.removeEventListener('click', closeDropdown)
  })
})
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: #c4d7eb;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* 顶部导航栏 */
.dashboard-header {
  background: rgb(255, 255, 255);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--border);
  height: 60px;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  display: flex;
  align-items: center;
  font-size: 22px;
  font-weight: 800;
  color: var(--brand-primary);
}

.logo-i {
  color: var(--brand-highlight);
  font-size: 26px;
  font-weight: 900;
  font-style: italic;
  margin-right: 2px;
}

.logo-campus {
  color: var(--text-primary);
  letter-spacing: 0.5px;
}

.brand-subtitle {
  color: var(--text-muted);
  font-size: 14px;
  margin-left: 16px;
  padding-left: 16px;
  border-left: 1px solid var(--border);
}

/* 用户区域 */
.user-section {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--brand-primary) 0%, #6aa3d6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: white;
  font-weight: 600;
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 15px;
}

.user-role {
  color: var(--text-muted);
  font-size: 12px;
  background: var(--brand-accent);
  padding: 2px 8px;
  border-radius: 2px;
  display: inline-block;
  max-width: fit-content;
}

.menu-toggle {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.menu-toggle:hover {
  background: var(--bg-soft);
}

.menu-icon {
  font-size: 10px;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  min-width: 140px;
  margin-top: 8px;
  overflow: hidden;
  z-index: 1000;
  border: 1px solid var(--border);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  border-bottom: 1px solid var(--border);
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: var(--brand-accent);
  color: var(--brand-primary);
}

.item-icon {
  font-size: 14px;
  color: var(--brand-primary);
  width: 16px;
  text-align: center;
}

/* 主内容区域 */
.dashboard-main {
  flex: 1;
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 20px;
  gap: 20px;
}

/* 侧边栏 */
.sidebar {
  width: 200px;
  flex-shrink: 0;
  background: white;
  border-radius: 6px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--border);
}

.nav-groups {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.nav-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.group-title {
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  padding-left: 10px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: none;
  border: none;
  border-radius: 4px;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.nav-link:hover {
  background: var(--brand-accent);
  color: var(--brand-primary);
}

.nav-link.active {
  background: var(--brand-primary);
  color: white;
}

.nav-icon {
  font-size: 14px;
  width: 18px;
  text-align: center;
}

.nav-text {
  flex: 1;
  text-align: left;
}

/* 内容区域 */
.content-wrapper {
  flex: 1;
  min-width: 0;
}

/* 面包屑导航 */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  background: white;
  border-radius: 6px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--border);
  font-size: 14px;
}

.breadcrumb-item {
  color: var(--brand-primary);
  text-decoration: none;
  font-weight: 500;
}

.breadcrumb-item:hover {
  text-decoration: underline;
}

.breadcrumb-separator {
  color: var(--text-muted);
}

.breadcrumb-current {
  color: var(--text-primary);
  font-weight: 600;
}

/* 路由内容区域 */
.router-content {
  background: white;
  border-radius: 6px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--border);
  min-height: 400px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .dashboard-main {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
  }
}

@media (max-width: 992px) {
  .header-content {
    flex-direction: column;
    height: auto;
    padding: 12px;
    gap: 12px;
  }
  
  .brand-section {
    flex-direction: column;
    text-align: center;
    gap: 6px;
  }
  
  .brand-subtitle {
    margin-left: 0;
    padding-left: 0;
    border-left: none;
    border-top: 1px solid var(--border);
    padding-top: 8px;
  }
  
  .user-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 8px;
  }
  
  .user-details {
    align-items: center;
  }
}

@media (max-width: 768px) {
  .dashboard-main {
    padding: 16px;
  }
  
  .breadcrumb {
    padding: 10px 12px;
    font-size: 13px;
  }
  
  .sidebar {
    padding: 12px;
  }
  
  .nav-link {
    padding: 8px 10px;
    font-size: 13px;
  }
  
  .router-content {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 10px;
  }
  
  .sidebar {
    padding: 10px;
  }
  
  .brand-logo {
    font-size: 20px;
  }
  
  .logo-i {
    font-size: 22px;
  }
  
  .brand-subtitle {
    font-size: 13px;
  }
}

/* 图标样式 */
.icon-user::before,
.icon-activity::before,
.icon-register::before,
.icon-admin::before,
.icon-create::before,
.icon-home::before,
.icon-chart::before {
  content: '';
  display: block;
  width: 18px;
  height: 18px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

/* 用户图标 */
.icon-user::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E");
}

/* 活动图标 */
.icon-activity::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M11 17c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1zm0-14v4h2V5.08c3.39.49 6 3.39 6 6.92 0 3.87-3.13 7-7 7s-7-3.13-7-7c0-1.68.59-3.22 1.58-4.42L12 13l1.41-1.41-6.8-6.8v.02C4.42 6.45 3 9.05 3 12c0 4.97 4.02 9 9 9s9-4.03 9-9c0-5.47-4.03-10-9-10h-1zm7 9c0-.55-.45-1-1-1s-1 .45-1 1 .45 1 1 1 1-.45 1-1z'/%3E%3C/svg%3E");
}

/* 报名图标 */
.icon-register::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E");
}

/* 管理员图标 */
.icon-admin::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z'/%3E%3C/svg%3E");
}

/* 创建图标 */
.icon-create::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'/%3E%3C/svg%3E");
}

/* 首页图标 */
.icon-home::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'/%3E%3C/svg%3E");
}

/* 统计图标 */
.icon-chart::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z'/%3E%3C/svg%3E");
}

/* 登出图标 */
.icon-logout::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z'/%3E%3C/svg%3E");
}

/* 导航链接中的图标颜色 */
.nav-link .nav-icon {
  color: var(--text-muted);
}

.nav-link:hover .nav-icon {
  color: var(--brand-primary);
}

.nav-link.active .nav-icon {
  color: white;
}
</style>