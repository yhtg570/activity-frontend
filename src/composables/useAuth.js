import { ref, reactive } from 'vue'
import axios from 'axios'

// 创建认证状态管理
export function useAuth() {
  const user = ref(null)
  const isAuthenticated = ref(false)

  // 配置 axios 基础 URL
  axios.defaults.baseURL = 'http://123.60.167.227:8080'

  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password
      })
      
      if (response.data.success) {
        user.value = response.data.user
        isAuthenticated.value = true
        localStorage.setItem('user', JSON.stringify(user.value))
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.data.message }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || '登录失败' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData)
      if (response.data.success) {
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.data.message }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || '注册失败' 
      }
    }
  }

  const logout = () => {
    user.value = null
    isAuthenticated.value = false
    localStorage.removeItem('user')
  }

  // 获取用户资料
  const fetchUserProfile = async (userId) => {
    try {
      const response = await axios.get(`/api/users/${userId}`)
      if (response.data) {
        // 更新本地用户信息
        user.value = { ...user.value, ...response.data }
        localStorage.setItem('user', JSON.stringify(user.value))
        return { success: true, data: response.data }
      } else {
        return { success: false, error: '获取用户资料失败' }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || '获取用户资料失败' 
      }
    }
  }

  // 更新用户资料
  const updateUserProfile = async (userId, profileData) => {
    try {
      const response = await axios.put(`/api/users/${userId}`, profileData)
      if (response.data) {
        // 更新本地用户信息
        user.value = { ...user.value, ...response.data }
        localStorage.setItem('user', JSON.stringify(user.value))
        return { success: true, data: response.data }
      } else {
        return { success: false, error: '更新资料失败' }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || '更新资料失败' 
      }
    }
  }

  // 修改密码
  const changePassword = async (userId, passwordData) => {
    try {
      const response = await axios.post(`/api/users/${userId}/change-password`, passwordData)
      if (response.data) {
        return { success: true, data: response.data }
      } else {
        return { success: false, error: '密码修改失败' }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || '密码修改失败' 
      }
    }
  }

  const init = () => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        // 如果 id 是字符串数字，转换为 Number，便于后端路径参数转换
        if (parsed && parsed.id && typeof parsed.id === 'string' && /^\d+$/.test(parsed.id)) {
          parsed.id = Number(parsed.id)
        }
        user.value = parsed
      } catch (e) {
        console.error('解析 localStorage 中的 user 失败:', e)
        user.value = null
      }
      isAuthenticated.value = true
    }
  }

  // 初始化
  init()

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUserProfile,
    updateUserProfile,
    changePassword
  }
}