<template>
  <div class="home-page">
    <!-- 欢迎面板 -->
    <div class="welcome-panel">
      <div class="welcome-header">
        <h1>欢迎使用 iCampus 校园活动管理系统</h1>
        <p class="welcome-subtitle">一站式校园活动管理与服务平台</p>
      </div>
      
      <div class="dashboard-cards">
        <div class="dashboard-card">
          <div class="card-icon icon-activity"></div>
          <div class="card-content">
            <h3>发现精彩活动</h3>
            <p>浏览校园各类精彩活动，丰富课余生活</p>
          </div>
          <button @click="$router.push('/dashboard/activities')" class="card-action">
            立即查看
          </button>
        </div>
        
        <div class="dashboard-card">
          <div class="card-icon icon-register"></div>
          <div class="card-content">
            <h3>活动报名管理</h3>
            <p>查看和管理您的活动报名记录</p>
          </div>
          <button @click="$router.push('/dashboard/my-registrations')" class="card-action">
            我的报名
          </button>
        </div>
        
        <div class="dashboard-card" v-if="isAdmin">
          <div class="card-icon icon-admin"></div>
          <div class="card-content">
            <h3>活动管理</h3>
            <p>发布和管理校园活动，统计参与数据</p>
          </div>
          <button @click="$router.push('/dashboard/admin/activities')" class="card-action">
            进入管理
          </button>
        </div>
        
        <div class="dashboard-card">
          <div class="card-icon icon-chart"></div>
          <div class="card-content">
            <h3>数据统计</h3>
            <p>查看活动参与情况和系统使用数据</p>
          </div>
          <button @click="$router.push('/dashboard/stats')" class="card-action">
            查看统计
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuth } from '../composables/useAuth'

const auth = useAuth()

const userData = computed(() => {
  return auth.user?._value || auth.user?._rawValue || auth.user || {}
})

const isAdmin = computed(() => {
  return userData.value.userType === 'ADMIN'
})
</script>

<style scoped>
.home-page {
  padding: 20px;
}

.welcome-panel {
  background: white;
  border-radius: 6px;
  padding: 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--border);
}

.welcome-header {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}

.welcome-header h1 {
  color: var(--text-primary);
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 700;
}

.welcome-subtitle {
  color: var(--text-muted);
  margin: 0;
  font-size: 15px;
}

/* 仪表板卡片 */
.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.dashboard-card {
  background: white;
  border-radius: 6px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.2s ease;
  border: 1px solid var(--border);
}

.dashboard-card:hover {
  border-color: var(--brand-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.card-icon {
  font-size: 24px;
  margin-bottom: 14px;
  color: var(--brand-primary);
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: var(--brand-accent);
}

.card-content {
  flex: 1;
}

.card-content h3 {
  color: var(--text-primary);
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 700;
}

.card-content p {
  color: var(--text-muted);
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
}

.card-action {
  margin-top: 18px;
  padding: 8px 16px;
  background: var(--brand-primary);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.card-action:hover {
  background: #6aa3d6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home-page {
    padding: 16px;
  }
  
  .welcome-panel {
    padding: 20px;
  }
  
  .welcome-header h1 {
    font-size: 20px;
  }
  
  .dashboard-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .home-page {
    padding: 16px;
  }
  
  .dashboard-card {
    padding: 16px;
  }
  
  .welcome-panel {
    padding: 16px;
  }
}

/* 图标样式 */
.icon-activity::before,
.icon-register::before,
.icon-admin::before,
.icon-chart::before {
  content: '';
  display: block;
  width: 18px;
  height: 18px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.icon-activity::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M11 17c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1zm0-14v4h2V5.08c3.39.49 6 3.39 6 6.92 0 3.87-3.13 7-7 7s-7-3.13-7-7c0-1.68.59-3.22 1.58-4.42L12 13l1.41-1.41-6.8-6.8v.02C4.42 6.45 3 9.05 3 12c0 4.97 4.02 9 9 9s9-4.03 9-9c0-5.47-4.03-10-9-10h-1zm7 9c0-.55-.45-1-1-1s-1 .45-1 1 .45 1 1 1 1-.45 1-1z'/%3E%3C/svg%3E");
}

.icon-register::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E");
}

.icon-admin::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z'/%3E%3C/svg%3E");
}

.icon-chart::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z'/%3E%3C/svg%3E");
}
</style>