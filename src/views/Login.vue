<template>
  <div class="login-page">
    <div class="login-container">
      <!-- 左侧品牌信息 -->
      <div class="brand-section">
        <div class="brand-content">
          <!-- 品牌Logo区域 -->
          <div class="brand-logo">
            <div class="logo-container">
              <div class="logo-main">
                <!-- 第一个 iCampus - 放大突出 -->
                <div class="logo-icon-large">
                  <span class="logo-i-large">i</span>
                  <span class="logo-campus-large">Campus</span>
                </div>
                <!-- 第二个 iCampus - 缩小至系统名称大小 -->
                <div class="system-name">
                  <span class="system-logo">
                    <span class="system-campus">iCampus</span>
                  </span>
                  校园活动管理系统
                </div>
              </div>
            </div>
          </div>
          
          <!-- 系统描述 -->
          <p class="brand-subtitle">
            连接学生、教师与精彩活动<br>
            让校园生活更加丰富多彩
          </p>
          
          <!-- 功能特点 -->
          <div class="features-list">
            <div class="feature-item">
              <span class="feature-icon icon-feature"></span>
              <span>丰富校园活动</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon icon-feature"></span>
              <span>便捷活动报名</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon icon-feature"></span>
              <span>智能活动管理</span>
            </div>
          </div>
          
          <!-- 页脚 -->
          <div class="login-footer">
            <p class="copyright">© 2025 软件工程实验课程作业</p>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单 - 保持不变 -->
      <div class="form-section">
        <div class="form-card">
          <div class="form-header">
            <h2>登录账户</h2>
            <p>使用您的账户登录系统</p>
          </div>

          <form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
              <label class="form-label">
                <span class="label-text">用户名 / 学号 / 工号</span>
              </label>
              <div class="input-with-icon">
                <span class="input-icon icon-user"></span>
                <input
                  v-model="loginForm.username"
                  placeholder="请输入用户名、学号或工号"
                  class="form-input"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="label-text">密码</span>
              </label>
              <div class="input-with-icon">
                <span class="input-icon icon-password"></span>
                <input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入登录密码"
                  class="form-input"
                  required
                />
              </div>
              <div class="password-helper">
                <a @click="showForgotPassword = true" class="forgot-link">
                  忘记密码？
                </a>
              </div>
            </div>

            <button 
              type="submit" 
              class="login-btn"
              :disabled="loading"
              :class="{ 'loading': loading }"
            >
              <span v-if="loading" class="btn-spinner"></span>
              {{ loading ? '登录中...' : '登录账户' }}
            </button>

            <div class="form-divider">
              <span class="divider-text">或</span>
            </div>

            <div class="alternative-login">
              <button type="button" class="alt-btn">
                手机验证码登录
              </button>
              <button type="button" class="alt-btn">
                邮箱登录
              </button>
            </div>

            <div v-if="error" class="error-message">
              <span class="error-icon">!</span>
              <span>{{ error }}</span>
            </div>
          </form>

          <div class="form-footer">
            <p>
              首次使用？
              <a @click="$router.push('/register')" class="register-link">
                立即注册
              </a>
            </p>
            <p class="security-note">
              您的账户信息安全加密存储
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 忘记密码提示 - 保持不变 -->
    <div v-if="showForgotPassword" class="forgot-modal">
      <div class="modal-overlay" @click="showForgotPassword = false"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>忘记密码？</h3>
          <button @click="showForgotPassword = false" class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <p>请联系系统管理员重置密码，或使用以下方式：</p>
          <ul class="help-list">
            <li>通过注册邮箱找回</li>
            <li>通过手机号验证重置</li>
            <li>联系所在部门管理员</li>
          </ul>
          <button @click="showForgotPassword = false" class="modal-confirm">
            我知道了
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const auth = useAuth()

const loading = ref(false)
const error = ref('')
const showForgotPassword = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    error.value = '请填写用户名和密码'
    return
  }

  loading.value = true
  error.value = ''
  
  const result = await auth.login(loginForm.username, loginForm.password)
  
  if (result.success) {
    router.push('/dashboard')
  } else {
    error.value = result.error || '登录失败，请检查用户名和密码'
  }
  
  loading.value = false
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.login-container {
  display: flex;
  max-width: 1200px;
  width: 100%;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  min-height: 600px;
  position: relative;
  z-index: 1;
}

/* 品牌区域 */
.brand-section {
  flex: 1;
  background: linear-gradient(135deg, var(--brand-primary) 0%, #6aa3d6 100%);
  padding: 50px 40px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.brand-content {
  max-width: 500px;
  margin: 0 auto;
}

/* 重新设计的Logo部分 */
.brand-logo {
  margin-bottom: 30px;
}

.logo-container {
  text-align: center;
}

.logo-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

/* 第一个 iCampus - 放大突出 */
.logo-icon-large {
  display: inline-flex;
  align-items: center;
  font-size: 56px; /* 放大尺寸 */
  font-weight: 900;
  margin-bottom: 8px;
}

.logo-i-large {
  color: var(--brand-highlight);
  font-size: 64px; /* 更大 */
  font-weight: 900;
  margin-right: 4px;
}

.logo-campus-large {
  color: #2c3e50;
  letter-spacing: 1px; /* 增加字间距 */
  font-weight: 900;
}

/* 第二个 iCampus - 缩小至系统名称大小 */
.system-name {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.4;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.system-logo {
  display: inline-flex;
  align-items: center;
  font-size: 28px; /* 与系统名称同样大小 */
  font-weight: 800;
  margin-bottom: 8px;
}

.system-i {
  color: var(--brand-highlight);
  font-size: 32px;
  font-weight: 900;
  margin-right: 2px;
  font-style: italic;
}

.system-campus {
  color: white;
  letter-spacing: 0.5px;
}

/* 系统描述 */
.brand-subtitle {
  font-size: 15px;
  line-height: 1.6;
  opacity: 0.9;
  margin-bottom: 40px;
  text-align: center;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

/* 功能特点 */
.features-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 60px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.2);
}

.feature-icon {
  width: 18px;
  height: 18px;
  background: white;
  color: var(--brand-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 11px;
}

.icon-feature::before {
  content: "✓";
}

/* 登录页脚 */
.login-footer {
  margin-top: auto;
  text-align: center;
  font-size: 14px;
  opacity: 0.8;
}

.login-footer a {
  color: white;
  text-decoration: underline;
  cursor: pointer;
  font-weight: 500;
}

.login-footer a:hover {
  opacity: 0.8;
}

.copyright {
  margin-top: 10px;
  font-size: 13px;
  opacity: 0.7;
}

/* ========== 表单区域（保持不变） ========== */

.form-section {
  flex: 1;
  padding: 50px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}

.form-card {
  width: 100%;
  max-width: 400px;
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-header h2 {
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.form-header p {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0;
}

/* 表单样式 */
.login-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
}

.label-text {
  display: inline-block;
}

.input-with-icon {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--brand-primary);
  font-size: 15px;
  z-index: 1;
  width: 16px;
  text-align: center;
}

.icon-user::before {
  content: "U";
  font-weight: bold;
}

.icon-password::before {
  content: "P";
  font-weight: bold;
}

.form-input {
  width: 100%;
  padding: 12px 14px 12px 36px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 15px;
  background: white;
  transition: all 0.2s ease;
  position: relative;
  z-index: 2;
}

.form-input:focus {
  outline: none;
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px rgba(131, 183, 225, 0.2);
}

.password-helper {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.forgot-link {
  color: var(--brand-primary);
  font-size: 13px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.forgot-link:hover {
  color: #6aa3d6;
  text-decoration: underline;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  padding: 14px;
  background: var(--brand-primary);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.login-btn:hover:not(:disabled) {
  background: #6aa3d6;
  box-shadow: 0 2px 6px rgba(131, 183, 225, 0.3);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-btn.loading {
  color: transparent;
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

@keyframes spin {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

/* 分割线 */
.form-divider {
  display: flex;
  align-items: center;
  margin: 24px 0;
}

.form-divider::before,
.form-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

.divider-text {
  padding: 0 14px;
  color: var(--text-muted);
  font-size: 13px;
}

/* 其他登录方式 */
.alternative-login {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}

.alt-btn {
  padding: 12px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.alt-btn:hover {
  border-color: var(--brand-primary);
  background: var(--brand-accent);
}

/* 错误提示 */
.error-message {
  background: #fef0f0;
  border: 1px solid #f56c6c;
  border-radius: 4px;
  padding: 12px 14px;
  color: #f56c6c;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
}

.error-icon {
  width: 18px;
  height: 18px;
  background: #f56c6c;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 11px;
  flex-shrink: 0;
}

/* 表单底部 */
.form-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.form-footer p {
  color: var(--text-muted);
  margin-bottom: 10px;
  font-size: 14px;
}

.register-link {
  color: var(--brand-primary);
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.register-link:hover {
  color: #6aa3d6;
  text-decoration: underline;
}

.security-note {
  font-size: 12px;
  opacity: 0.7;
}

/* 忘记密码模态框 */
.forgot-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.modal-content {
  position: relative;
  background: white;
  border-radius: 6px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1001;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  color: var(--text-primary);
  margin: 0;
  font-size: 18px;
}

.modal-close {
  background: none;
  border: none;
  font-size: 22px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--border);
  color: var(--text-primary);
}

.modal-body {
  color: var(--text-muted);
  line-height: 1.6;
  font-size: 14px;
}

.help-list {
  margin: 16px 0;
  padding-left: 20px;
  list-style: none;
}

.help-list li {
  margin-bottom: 8px;
  padding: 6px 0;
  position: relative;
}

.help-list li:before {
  content: "•";
  color: var(--brand-primary);
  font-weight: bold;
  display: inline-block;
  width: 1em;
  margin-left: -1em;
}

.modal-confirm {
  width: 100%;
  padding: 12px;
  background: var(--brand-primary);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 16px;
}

.modal-confirm:hover {
  background: #6aa3d6;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .login-container {
    flex-direction: column;
    max-width: 600px;
  }
  
  .brand-section {
    padding: 40px;
  }
  
  .brand-content {
    text-align: center;
  }
  
  .feature-item {
    justify-content: center;
  }
  
  .alternative-login {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .login-page {
    padding: 16px;
  }
  
  /* 响应式调整Logo大小 */
  .logo-icon-large {
    font-size: 44px;
  }
  
  .logo-i-large {
    font-size: 52px;
  }
  
  .system-name {
    font-size: 24px;
  }
  
  .system-logo {
    font-size: 24px;
  }
  
  .system-i {
    font-size: 28px;
  }
  
  .brand-subtitle {
    font-size: 14px;
  }
  
  .form-section {
    padding: 40px 24px;
  }
  
  .form-header h2 {
    font-size: 22px;
  }
}

@media (max-width: 480px) {
  .brand-section {
    padding: 32px 24px;
  }
  
  .form-section {
    padding: 32px 20px;
  }
  
  /* 进一步调整移动端Logo */
  .logo-icon-large {
    font-size: 36px;
  }
  
  .logo-i-large {
    font-size: 42px;
  }
  
  .system-name {
    font-size: 20px;
  }
  
  .system-logo {
    font-size: 20px;
  }
  
  .system-i {
    font-size: 24px;
  }
  
  .feature-item {
    font-size: 14px;
    padding: 10px 14px;
  }
  
  .form-card {
    max-width: 100%;
  }
}
</style>