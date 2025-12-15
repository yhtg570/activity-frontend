<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-header-content">
        <div class="page-header-left">
          <h1>个人资料</h1>
          <p class="page-header-subtitle">管理您的账户信息和密码</p>
        </div>
      </div>
    </div>

    <div class="profile-content">
      <!-- 用户头像和基本信息 -->
      <div class="profile-card">
        <div class="user-avatar-section">
          <div class="avatar-circle large">
            {{ getUserInitial(user.realName || user.username) }}
          </div>
          <div class="user-summary">
            <h2>{{ user.realName || user.username }}</h2>
            <div class="user-type-badge">
              {{ getUserTypeText(user.userType) }}
            </div>
          </div>
        </div>
        
        <div class="user-basic-info">
          <div class="info-row">
            <div class="info-label">用户名</div>
            <div class="info-value">{{ user.username }}</div>
          </div>
          <div v-if="user.userType === 'STUDENT'" class="info-row">
            <div class="info-label">学号</div>
            <div class="info-value">{{ user.studentId }}</div>
          </div>
          <div v-if="user.userType === 'TEACHER'" class="info-row">
            <div class="info-label">工号</div>
            <div class="info-value">{{ user.teacherId }}</div>
          </div>
          <div v-if="user.userType === 'ADMIN'" class="info-row">
            <div class="info-label">管理员ID</div>
            <div class="info-value">#{{ user.id }}</div>
          </div>
        </div>
      </div>

      <!-- 基本信息编辑卡片 -->
      <div class="profile-card">
        <div class="card-header">
          <h2>基本信息</h2>
          <button 
            @click="editMode = !editMode" 
            class="edit-btn"
            :class="{ 'cancel': editMode }"
          >
            {{ editMode ? '取消' : '编辑' }}
          </button>
        </div>

        <div v-if="!editMode" class="info-display">
          <div class="info-item">
            <div class="info-label">真实姓名</div>
            <div class="info-value">{{ user.realName || '未设置' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">邮箱</div>
            <div class="info-value">{{ user.email || '未设置' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">手机号</div>
            <div class="info-value">{{ user.phone || '未设置' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">{{ user.userType === 'STUDENT' ? '班级' : '部门' }}</div>
            <div class="info-value">{{ user.className || user.department || '未设置' }}</div>
          </div>
        </div>

        <form v-else @submit.prevent="handleUpdateProfile" class="info-edit">
          <div class="form-row">
            <div class="form-group">
              <label>真实姓名</label>
              <input v-model="editForm.realName" type="text" :placeholder="user.realName || '请输入真实姓名'">
            </div>
            <div class="form-group">
              <label>邮箱</label>
              <input v-model="editForm.email" type="email" :placeholder="user.email || '请输入邮箱'">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>手机号</label>
              <input v-model="editForm.phone" type="tel" :placeholder="user.phone || '请输入手机号'">
            </div>
            <div class="form-group">
              <label>{{ user.userType === 'STUDENT' ? '班级' : '部门' }}</label>
              <input 
                v-if="user.userType === 'STUDENT'"
                v-model="editForm.className" 
                type="text" 
                :placeholder="user.className || '请输入班级'"
              >
              <input 
                v-else
                v-model="editForm.department" 
                type="text" 
                :placeholder="user.department || '请输入部门'"
              >
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" :disabled="updating" class="save-btn">
              {{ updating ? '保存中...' : '保存更改' }}
            </button>
          </div>
        </form>
      </div>

      <!-- 修改密码卡片 -->
      <div class="profile-card">
        <div class="card-header">
          <h2>修改密码</h2>
        </div>
        
        <form @submit.prevent="handleChangePassword" class="password-form">
          <div class="form-group">
            <label>原密码</label>
            <div class="input-with-icon">
              <span class="input-icon icon-password"></span>
              <input v-model="passwordForm.oldPassword" type="password" required placeholder="请输入原密码">
            </div>
          </div>
          <div class="form-group">
            <label>新密码</label>
            <div class="input-with-icon">
              <span class="input-icon icon-password"></span>
              <input v-model="passwordForm.newPassword" type="password" required placeholder="请输入新密码" minlength="6">
            </div>
          </div>
          <div class="form-group">
            <label>确认新密码</label>
            <div class="input-with-icon">
              <span class="input-icon icon-password"></span>
              <input v-model="passwordForm.confirmPassword" type="password" required placeholder="请再次输入新密码">
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" :disabled="changingPassword" class="save-btn">
              {{ changingPassword ? '修改中...' : '修改密码' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 消息提示 -->
    <div v-if="message" class="message" :class="{ 'error': isError }">
      <span class="message-icon">{{ isError ? '×' : '✓' }}</span>
      <span>{{ message }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'

const { user, updateUserProfile, changePassword } = useAuth()

const editMode = ref(false)
const updating = ref(false)
const changingPassword = ref(false)
const message = ref('')
const isError = ref(false)

const editForm = reactive({
  realName: '',
  email: '',
  phone: '',
  className: '',
  department: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const getUserInitial = (name) => {
  return name ? name.charAt(0).toUpperCase() : 'U'
}

const getUserTypeText = (type) => {
  const types = {
    'STUDENT': '学生',
    'TEACHER': '教师', 
    'ADMIN': '管理员'
  }
  return types[type] || type
}

const showMessage = (msg, error = false) => {
  message.value = msg
  isError.value = error
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

const handleUpdateProfile = async () => {
  updating.value = true
  
  // 过滤掉空值
  const profileData = Object.fromEntries(
    Object.entries(editForm).filter(([_, value]) => value !== '')
  )
  
  // 基本校验：邮箱格式、手机号格式
  if (profileData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(profileData.email)) {
      showMessage('请输入有效的邮箱地址', true)
      updating.value = false
      return
    }
  }
  if (profileData.phone) {
    const phoneRegex = /^\d{7,15}$/
    if (!phoneRegex.test(profileData.phone)) {
      showMessage('请输入有效的手机号（仅数字）', true)
      updating.value = false
      return
    }
  }

  const result = await updateUserProfile(user.value.id, profileData)
  
  if (result.success) {
    showMessage('资料更新成功')
    editMode.value = false
    // 清空编辑表单
    Object.keys(editForm).forEach(key => {
      editForm[key] = ''
    })
  } else {
    showMessage(result.error, true)
  }
  updating.value = false
}

const handleChangePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    showMessage('两次输入的新密码不一致', true)
    return
  }
  
  if (passwordForm.newPassword.length < 6) {
    showMessage('新密码长度至少6位', true)
    return
  }

  changingPassword.value = true
  const result = await changePassword(user.value.id, {
    oldPassword: passwordForm.oldPassword,
    newPassword: passwordForm.newPassword
  })
  
  if (result.success) {
    showMessage('密码修改成功')
    // 清空表单
    Object.keys(passwordForm).forEach(key => {
      passwordForm[key] = ''
    })
  } else {
    showMessage(result.error, true)
  }
  changingPassword.value = false
}

onMounted(() => {
  // 初始化编辑表单
  Object.assign(editForm, {
    realName: user.value.realName || '',
    email: user.value.email || '',
    phone: user.value.phone || '',
    className: user.value.className || '',
    department: user.value.department || ''
  })
})
</script>

<style scoped>

  /* 修复页面背景色 */
.page-container {
  background: white !important;
  background-color: white !important;
}
.profile-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.profile-header {
  text-align: center;
  margin-bottom: 30px;
}

.profile-header h1 {
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.profile-header p {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 通用卡片样式 */
.profile-card {
  background: white;
  border-radius: 6px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  border: 1px solid var(--border);
}

/* 用户头像区域 */
.user-avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
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
}

.avatar-circle.large {
  width: 64px;
  height: 64px;
  font-size: 24px;
}

.user-summary h2 {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 6px 0;
}

.user-type-badge {
  display: inline-block;
  background: var(--brand-accent);
  color: var(--brand-primary);
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
}

/* 基本信息显示 */
.user-basic-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
}

.info-value {
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 600;
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.card-header h2 {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.edit-btn {
  background: var(--brand-primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.2s ease;
}

.edit-btn:hover {
  background: #6aa3d6;
}

.edit-btn.cancel {
  background: #6c757d;
}

.edit-btn.cancel:hover {
  background: #5a6268;
}

/* 信息显示模式 */
.info-display {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-display .info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

.info-display .info-item:last-child {
  border-bottom: none;
}

/* 编辑表单 */
.info-edit .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.password-form {
  max-width: 400px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 15px;
  transition: border-color 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px rgba(131, 183, 225, 0.2);
}

/* 输入框带图标 */
.input-with-icon {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--brand-primary);
  font-size: 14px;
  z-index: 1;
}

.input-with-icon input {
  padding-left: 36px;
}

.icon-password::before {
  content: "P";
  font-weight: bold;
}

/* 表单操作 */
.form-actions {
  text-align: right;
  margin-top: 24px;
}

.save-btn {
  background: var(--brand-primary);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.2s ease;
}

.save-btn:hover:not(:disabled) {
  background: #6aa3d6;
}

.save-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

/* 消息提示 */
.message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 14px 18px;
  border-radius: 4px;
  color: white;
  background: #28a745;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.message.error {
  background: #dc3545;
}

.message-icon {
  font-weight: bold;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-container {
    padding: 16px;
  }
  
  .profile-card {
    padding: 20px;
  }
  
  .info-edit .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .user-basic-info {
    grid-template-columns: 1fr;
  }
  
  .user-avatar-section {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .form-group input {
    font-size: 14px;
  }
  
  .message {
    top: 16px;
    right: 16px;
    left: 16px;
    text-align: center;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .profile-container {
    padding: 12px;
  }
  
  .profile-card {
    padding: 16px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .card-header h2 {
    font-size: 16px;
  }
  
  .edit-btn {
    width: 100%;
  }
  
  .save-btn {
    width: 100%;
  }
  
  .form-actions {
    text-align: center;
  }
}
</style>