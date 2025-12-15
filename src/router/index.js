import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import Home from '../views/Home.vue'  // 导入首页组件
import ActivityList from '../views/ActivityList.vue'
import MyRegistrations from '../views/MyRegistrations.vue'
import Profile from '../views/Profile.vue'
import ActivityCreate from '../views/ActivityCreate.vue'
import AdminActivityManagement from '../views/AdminActivityManagement.vue'
import ActivityEdit from '../views/ActivityEdit.vue'
import DashboardStats from '../views/DashboardStats.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',  // 空路径对应首页
        name: 'Home',
        component: Home
      },
      {
        path: 'activities',
        name: 'Activities',
        component: ActivityList
      },
      {
        path: 'my-registrations',
        name: 'MyRegistrations',
        component: MyRegistrations
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile
      },
      {
        path: 'activities/create',
        name: 'ActivityCreate',
        component: ActivityCreate
      },
      {
        path: 'admin/activities',
        name: 'AdminActivities',
        component: AdminActivityManagement
      },
      {
        path: 'activities/edit/:id',
        name: 'ActivityEdit',
        component: ActivityEdit
      },
      {
        path: 'stats',
        name: 'DashboardStats',
        component: DashboardStats
      }
    ]
  },
  // 添加重定向
  {
    path: '/stats',
    redirect: '/dashboard/stats'
  },
  {
    path: '/activities',
    redirect: '/dashboard/activities'
  },
  {
    path: '/my-registrations',
    redirect: '/dashboard/my-registrations'
  },
  {
    path: '/profile',
    redirect: '/dashboard/profile'
  },
  {
    path: '/activities/create',
    redirect: '/dashboard/activities/create'
  },
  {
    path: '/admin/activities',
    redirect: '/dashboard/admin/activities'
  },
  {
    path: '/activities/edit/:id',
    redirect: '/dashboard/activities/edit/:id'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 添加路由守卫
router.beforeEach((to, from, next) => {
  // 这里可以添加认证检查逻辑
  // 暂时先放行所有路由
  next()
})

export default router