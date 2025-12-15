<template>
  <div class="register-page">
    <!-- 背景装饰 -->
    <div class="decoration-shape shape-1"></div>
    <div class="decoration-shape shape-2"></div>
    <div class="decoration-shape shape-3"></div>
    
    <div class="register-container">
      <!-- 左侧表单区域 -->
      <div class="form-section">
        <div class="form-wrapper">
          <div class="form-header">
            <router-link to="/login" class="back-link">
              <i class="icon-back">←</i>
              返回登录
            </router-link>
            <h1><span class="icon-register"></span> 创建账户</h1>
          </div>
          <form @submit.prevent="handleRegister" class="register-form">
            <!-- 步骤指示器 -->
            <div class="step-indicator">
              <div class="step-item active">
                <div class="step-number">1</div>
                <div class="step-label">账户类型</div>
              </div>
              <div class="step-line"></div>
              <div class="step-item" :class="{ 'active': activeStep >= 2 }">
                <div class="step-number">2</div>
                <div class="step-label">基本信息</div>
              </div>
              <div class="step-line"></div>
              <div class="step-item" :class="{ 'active': activeStep >= 3 }">
                <div class="step-number">3</div>
                <div class="step-label">完成注册</div>
              </div>
            </div>
            
            <!-- 用户类型选择 -->
            <div class="form-step" v-show="activeStep === 1">
              <h3 class="step-title"><span class="icon-step"></span> 选择您的身份</h3>              
              <div class="user-type-grid">
                <label 
                  v-for="type in userTypes" 
                  :key="type.value" 
                  class="user-type-card"
                  :class="{ 'selected': registerForm.userType === type.value }"
                  @click="selectUserType(type.value)"
                >
                  <input 
                    type="radio" 
                    v-model="registerForm.userType" 
                    :value="type.value"
                    class="radio-input"
                  >
                  <div class="card-content">
                    <div class="type-icon">
                      <span :class="['icon', 'icon-' + type.value.toLowerCase()]"></span>
                    </div>
                    <h4 class="type-title">{{ type.title }}</h4>
                    <p class="type-desc">{{ type.description }}</p>
                    <div class="type-features">
                      <span v-for="feature in type.features" :key="feature" class="feature-tag">
                        {{ feature }}
                      </span>
                    </div>
                  </div>
                </label>
              </div>
              
              <!-- 第一步错误提示 -->
              <div v-if="step1Error" class="error-message">
                <span class="error-icon">!</span>
                {{ step1Error }}
              </div>
            </div>
            
            <!-- 表单信息 -->
            <div class="form-step" v-show="activeStep === 2">
              <h3 class="step-title"><span class="icon-step icon-form"></span> 填写基本信息</h3>
              <p class="step-description">请完善您的个人信息，带 * 号为必填项</p>
              
              <div class="form-content">
                <!-- 用户名 -->
                <div class="form-group">
                  <label class="form-label">
                    <span class="icon-label">
                      <span class="icon icon-user"></span>
                    </span>
                    用户名 *
                  </label>
                  <div class="input-with-icon">
                    <span class="input-icon icon-user"></span>
                    <input
                      v-model="registerForm.username"
                      placeholder="设置您的登录用户名"
                      class="form-input"
                      required
                      @input="validateUsername"
                    >
                    <div class="input-border"></div>
                  </div>
                  <!-- 仅在有输入且有验证结果时才显示反馈 -->
                  <div v-if="registerForm.username && (usernameError || isUsernameValid)" 
                       class="input-feedback" 
                       :class="{ 'error': usernameError }">
                    <span class="feedback-icon">{{ usernameError ? '×' : '✓' }}</span>
                    {{ usernameError || '用户名可用' }}
                  </div>
                </div>

                <!-- 学号/工号 -->
                <div class="form-group" v-if="registerForm.userType === 'STUDENT'">
                  <label class="form-label">
                    <span class="icon-label icon-id"></span>
                    学号 *
                  </label>
                  <div class="input-with-icon">
                    <span class="input-icon icon-id"></span>
                    <input
                      v-model="registerForm.studentId"
                      placeholder="请输入您的学号"
                      class="form-input"
                      required
                    >
                    <div class="input-border"></div>
                  </div>
                </div>

                <div class="form-group" v-if="registerForm.userType === 'TEACHER'">
                  <label class="form-label">
                    <span class="icon-label icon-id"></span>
                    工号 *
                  </label>
                  <div class="input-with-icon">
                    <span class="input-icon icon-id"></span>
                    <input
                      v-model="registerForm.teacherId"
                      placeholder="请输入您的工号"
                      class="form-input"
                      required
                    >
                    <div class="input-border"></div>
                  </div>
                </div>

                <!-- 真实姓名 -->
                <div class="form-group">
                  <label class="form-label">
                    <span class="icon-label icon-name"></span>
                    真实姓名 *
                  </label>
                  <div class="input-with-icon">
                    <span class="input-icon icon-name"></span>
                    <input
                      v-model="registerForm.realName"
                      placeholder="请输入您的真实姓名"
                      class="form-input"
                      required
                    >
                    <div class="input-border"></div>
                  </div>
                </div>

                <!-- 密码 -->
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">
                      <span class="icon-label icon-password"></span>
                      密码 *
                    </label>
                    <div class="input-with-icon">
                      <span class="input-icon icon-password"></span>
                      <input
                        v-model="registerForm.password"
                        type="password"
                        placeholder="设置登录密码（至少6位）"
                        class="form-input"
                        required
                        minlength="6"
                        @input="validatePassword"
                      >
                      <div class="input-border"></div>
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label class="form-label">
                      <span class="icon-label icon-confirm"></span>
                      确认密码 *
                    </label>
                    <div class="input-with-icon">
                      <span class="input-icon icon-confirm"></span>
                      <input
                        v-model="registerForm.confirmPassword"
                        type="password"
                        placeholder="请再次输入密码"
                        class="form-input"
                        required
                        @input="validatePassword"
                      >
                      <div class="input-border"></div>
                    </div>
                  </div>
                </div>

                <div v-if="passwordMismatch" class="error-message">
                  <span class="error-icon">!</span>
                  两次输入的密码不一致
                </div>

                <div v-if="registerForm.password && !passwordMismatch" class="password-strength">
                  <div class="strength-label">密码强度：</div>
                  <div class="strength-meter">
                    <div class="strength-bar" :class="passwordStrengthClass"></div>
                  </div>
                  <div class="strength-text">{{ passwordStrengthText }}</div>
                </div>

                <!-- 邮箱 -->
                <div class="form-group">
                  <label class="form-label">
                    <span class="icon-label icon-email"></span>
                    邮箱
                  </label>
                  <div class="input-with-icon">
                    <span class="input-icon icon-email"></span>
                    <input
                      v-model="registerForm.email"
                      type="email"
                      placeholder="请输入您的邮箱（可选）"
                      class="form-input"
                    >
                    <div class="input-border"></div>
                  </div>
                </div>

                <!-- 手机号 -->
                <div class="form-group">
                  <label class="form-label">
                    <span class="icon-label icon-phone"></span>
                    手机号
                  </label>
                  <div class="input-with-icon">
                    <span class="input-icon icon-phone"></span>
                    <input
                      v-model="registerForm.phone"
                      placeholder="请输入您的手机号（可选）"
                      class="form-input"
                    >
                    <div class="input-border"></div>
                  </div>
                </div>

                <!-- 班级/部门 -->
                <div class="form-group" v-if="registerForm.userType === 'STUDENT'">
                  <label class="form-label">
                    <span class="icon-label icon-class"></span>
                    班级
                  </label>
                  <div class="input-with-icon">
                    <span class="input-icon icon-class"></span>
                    <input
                      v-model="registerForm.className"
                      placeholder="请输入您的班级（可选）"
                      class="form-input"
                    >
                    <div class="input-border"></div>
                  </div>
                </div>

                <div class="form-group" v-if="registerForm.userType === 'TEACHER'">
                  <label class="form-label">
                    <span class="icon-label icon-department"></span>
                    部门
                  </label>
                  <div class="input-with-icon">
                    <span class="input-icon icon-department"></span>
                    <input
                      v-model="registerForm.department"
                      placeholder="请输入您所在的部门（可选）"
                      class="form-input"
                    >
                    <div class="input-border"></div>
                  </div>
                </div>

                <!-- 服务条款 -->
                <div class="terms-agreement">
                  <label class="terms-label">
                    <input type="checkbox" v-model="agreeTerms" class="terms-checkbox">
                    <span class="terms-text">
                      我已阅读并同意
                      <a href="#" class="terms-link">《服务条款》</a>
                      和
                      <a href="#" class="terms-link">《隐私政策》</a>
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <!-- 提交按钮 -->
            <div class="form-actions">
              <button 
                v-if="activeStep === 1"
                type="button"
                @click="goToNextStep"
                class="btn-next"
                :disabled="!registerForm.userType"
              >
                下一步 <span class="btn-icon">→</span>
              </button>
              
              <div v-if="activeStep === 2" class="step-buttons">
                <button 
                  type="button"
                  @click="goToPrevStep"
                  class="btn-prev"
                >
                  <span class="btn-icon">←</span> 上一步
                </button>
                <button 
                  type="submit" 
                  class="btn-submit"
                  :disabled="loading || !agreeTerms || passwordMismatch"
                  :class="{ 'loading': loading }"
                >
                  <span v-if="loading" class="btn-spinner"></span>
                  <span v-else class="btn-icon"></span>
                  {{ loading ? '注册中...' : '完成注册' }}
                </button>
              </div>
            </div>

            <div v-if="error" class="error-message">
              <span class="error-icon">!</span>
              <span>{{ error }}</span>
            </div>
          </form>

          <div class="form-footer">
            <p>已有账户？<a @click="$router.push('/login')" class="login-link">立即登录</a></p>
          </div>
        </div>
      </div>

      <!-- 右侧信息区域 -->
      <div class="info-section">
        <div class="info-content">
          <div class="info-header">
            <h2>加入我们，<br>体验精彩校园生活</h2>
            <p class="info-subtitle">一站式校园活动管理平台</p>
          </div>
          
          <div class="benefits-list">
            <div class="benefit-item">
              <div class="benefit-icon">
                <span class="icon icon-target"></span>
              </div>
              <div class="benefit-content">
                <h4>发现精彩活动</h4>
                <p>参与各类校园活动，丰富课余生活</p>
              </div>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon">
                <span class="icon icon-handshake"></span>
              </div>
              <div class="benefit-content">
                <h4>便捷在线报名</h4>
                <p>一键报名感兴趣的活动，轻松管理</p>
              </div>
            </div>

            <div class="benefit-item">
              <div class="benefit-icon">
                <span class="icon icon-mobile-friendly"></span>
              </div>
              <div class="benefit-content">
                <h4>移动端友好</h4>
                <p>随时随地查看和参与活动</p>
              </div>
            </div>

            <div class="benefit-item">
              <div class="benefit-icon">
                <span class="icon icon-safe"></span>
              </div>
              <div class="benefit-content">
                <h4>安全可靠</h4>
                <p>多重安全机制保护您的信息安全</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const auth = useAuth()

const loading = ref(false)
const error = ref('')
const step1Error = ref('') // 第一步错误提示
const activeStep = ref(1)
const agreeTerms = ref(false)
const usernameError = ref('')
const isUsernameValid = ref(false)

const userTypes = [
  {
    value: 'STUDENT',
    title: '学生',
    icon: 'icon-student',
    description: '参与校园活动，丰富课余生活',
    features: ['活动报名', '查看活动', '评价活动']
  },
  {
    value: 'TEACHER',
    title: '教职工',
    icon: 'icon-teacher',
    description: '组织管理活动，指导学生发展',
    features: ['发布活动', '活动管理', '数据统计']
  },
  {
    value: 'ADMIN',
    title: '管理员',
    icon: 'icon-admin',
    description: '系统管理与用户权限控制',
    features: ['用户管理', '系统设置', '数据审核']
  }
]

const registerForm = reactive({
  userType: '', // 改为空字符串，不设置默认值
  username: '',
  studentId: '',
  teacherId: '',
  realName: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: '',
  className: '',
  department: ''
})

// 计算属性：检查密码是否匹配
const passwordMismatch = computed(() => {
  return registerForm.password && registerForm.confirmPassword && 
         registerForm.password !== registerForm.confirmPassword
})

// 密码强度检测
const passwordStrength = computed(() => {
  const password = registerForm.password
  if (!password) return 0
  
  let strength = 0
  if (password.length >= 6) strength += 1
  if (password.length >= 8) strength += 1
  if (/[A-Z]/.test(password)) strength += 1
  if (/[0-9]/.test(password)) strength += 1
  if (/[^A-Za-z0-9]/.test(password)) strength += 1
  
  return Math.min(strength, 5)
})

const passwordStrengthClass = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 2) return 'weak'
  if (strength <= 3) return 'medium'
  return 'strong'
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 2) return '较弱'
  if (strength <= 3) return '中等'
  if (strength <= 4) return '较强'
  return '非常强'
})

// 用户名验证 - 修改：将最小长度从3改为2个字符，空用户名时不显示提示
const validateUsername = () => {
  const username = registerForm.username
  if (!username) {
    usernameError.value = ''
    isUsernameValid.value = false
    return
  }
  
  if (username.length < 2) {
    usernameError.value = '用户名至少2个字符'
    isUsernameValid.value = false
  } else if (username.length > 20) {
    usernameError.value = '用户名最多20个字符'
    isUsernameValid.value = false
  } else if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
    usernameError.value = '只能包含字母、数字、中文和下划线'
    isUsernameValid.value = false
  } else {
    usernameError.value = ''
    isUsernameValid.value = true
  }
}

// 密码验证
const validatePassword = () => {
  // 触发密码强度更新
}

// 监听用户类型变化，重置相关字段
watch(() => registerForm.userType, (newType) => {
  if (newType !== 'STUDENT') registerForm.studentId = ''
  if (newType !== 'TEACHER') registerForm.teacherId = ''
  step1Error.value = '' // 清除错误提示
})

// 点击用户类型卡片
const selectUserType = (typeValue) => {
  registerForm.userType = typeValue
}

// 点击下一步
const goToNextStep = () => {
  if (!registerForm.userType) {
    step1Error.value = '请选择您的身份类型'
    return
  }
  
  activeStep.value = 2
  step1Error.value = ''
  error.value = ''
}

// 点击上一步
const goToPrevStep = () => {
  activeStep.value = 1
  error.value = ''
}

const handleRegister = async () => {
  // 前端验证
  if (!registerForm.username) {
    error.value = '请输入用户名'
    return
  }
  if (usernameError.value) {
    error.value = '请修正用户名错误'
    return
  }
  if (!registerForm.realName) {
    error.value = '请输入真实姓名'
    return
  }
  if (!registerForm.password) {
    error.value = '请输入密码'
    return
  }
  if (registerForm.password.length < 6) {
    error.value = '密码长度不能少于6位'
    return
  }
  if (passwordMismatch.value) {
    error.value = '两次输入的密码不一致'
    return
  }
  if (registerForm.userType === 'STUDENT' && !registerForm.studentId) {
    error.value = '请输入学号'
    return
  }
  if (registerForm.userType === 'TEACHER' && !registerForm.teacherId) {
    error.value = '请输入工号'
    return
  }
  if (!agreeTerms.value) {
    error.value = '请同意服务条款'
    return
  }

  loading.value = true
  error.value = ''

  try {
    // 准备注册数据
    const registerData = { ...registerForm }
    delete registerData.confirmPassword

    const result = await auth.register(registerData)
    
    if (result.success) {
      activeStep.value = 3
      setTimeout(() => {
        alert('注册成功！请登录')
        router.push('/login')
      }, 1000)
    } else {
      error.value = result.error || '注册失败'
    }
  } catch (err) {
    error.value = '注册失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-soft) 0%, #e8f4ff 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

/* 背景装饰 */
.decoration-shape {
  position: absolute;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-accent) 100%);
  opacity: 0.1;
  animation: float 25s infinite linear;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 5%;
  animation-delay: 0s;
  animation-duration: 30s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  right: 10%;
  animation-delay: -10s;
  animation-duration: 35s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  top: 60%;
  left: 15%;
  animation-delay: -5s;
  animation-duration: 40s;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-30px) rotate(120deg); }
  66% { transform: translateY(30px) rotate(240deg); }
}

.register-container {
  display: flex;
  max-width: 1400px;
  width: 100%;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 800px;
  position: relative;
  z-index: 1;
}

/* 表单区域 */
.form-section {
  flex: 1.2;
  padding: 40px;
  overflow-y: auto;
  max-height: 800px;
}

.form-wrapper {
  max-width: 700px;
  margin: 0 auto;
}

.form-header {
  margin-bottom: 40px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--brand-primary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-link:hover {
  gap: 12px;
  color: #6aa3d6;
}

.form-header h1 {
  color: var(--text-primary);
  font-size: 36px;
  font-weight: 800;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-register {
  display: inline-block;
  width: 36px;
  height: 36px;
  background: var(--brand-primary);
  color: white;
  border-radius: 6px;
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-register::before {
  content: "+";
}

/* 步骤指示器 */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 40px 0 60px;
  position: relative;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--border);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.step-item.active .step-number {
  background: linear-gradient(135deg, var(--brand-primary) 0%, #6aa3d6 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(131, 183, 225, 0.3);
}

.step-label {
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.step-item.active .step-label {
  color: var(--brand-primary);
  font-weight: 600;
}

.step-line {
  flex: 1;
  height: 2px;
  background: var(--border);
  margin: 0 15px;
  position: relative;
  top: -20px;
}

.step-line::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 0;
  background: var(--brand-primary);
  transition: width 0.3s ease;
}

.step-item:nth-child(2).active ~ .step-line::before {
  width: 50%;
}

.step-item:nth-child(3).active ~ .step-line::before {
  width: 100%;
}

/* 用户类型选择 */
.user-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.user-type-card {
  position: relative;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.user-type-card:hover {
  border-color: var(--brand-primary);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(131, 183, 225, 0.1);
}

.user-type-card.selected {
  border-color: var(--brand-primary);
  background: var(--brand-accent);
  box-shadow: 0 4px 16px rgba(131, 183, 225, 0.15);
}

.radio-input {
  position: absolute;
  opacity: 0;
}

.card-content {
  text-align: center;
}

/* 修复：添加具体内容到空规则集 */
.type-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 16px;
  border-radius: 8px;
  background: var(--brand-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--brand-primary);
  transition: all 0.3s ease;
}

.user-type-card.selected .type-icon {
  background: var(--brand-primary);
  color: white;
}

.type-title {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.type-desc {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.type-features {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}

.feature-tag {
  background: var(--brand-accent);
  color: var(--brand-primary);
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

/* 表单步骤 */
.form-step {
  animation: slideIn 0.5s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.step-title {
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-step {
  display: inline-block;
  width: 28px;
  height: 28px;
  background: var(--brand-primary);
  color: white;
  border-radius: 6px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-step::before {
  content: "✓";
  font-weight: bold;
}

.icon-step.icon-form::before {
  content: "F";
}

.step-description {
  color: var(--text-muted);
  font-size: 15px;
  margin: 0 0 32px 0;
}

/* 表单内容 */
.form-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  margin-bottom: 8px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 8px;
}

/* 修复：添加具体内容 */
.icon-label {
  display: inline-block;
  width: 20px;
  height: 20px;
  color: var(--brand-primary);
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-user::before {font-weight: bold; }
.icon-id::before {font-size: 10px; font-weight: bold; }
.icon-name::before {font-weight: bold; }
.icon-password::before { font-weight: bold; }
.icon-confirm::before {font-weight: bold; }
.icon-email::before {font-weight: bold; }
.icon-phone::before {font-weight: bold; }
.icon-class::before {font-weight: bold; }
.icon-department::before {font-weight: bold; }

.input-with-icon {
  position: relative;
}

/* 修复：添加具体内容 */
.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--brand-primary);
  font-size: 16px;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
}

.form-input {
  width: 100%;
  padding: 14px 14px 14px 40px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 16px;
  background: white;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.form-input:focus {
  outline: none;
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px rgba(131, 183, 225, 0.2);
}

.input-border {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--brand-primary);
  transition: all 0.3s ease;
  transform: translateX(-50%);
  z-index: 1;
}

.form-input:focus + .input-border {
  width: 100%;
}

.input-feedback {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  margin-top: 6px;
  margin-left: 8px;
}

.input-feedback.error {
  color: #f56c6c;
}

.input-feedback:not(.error) {
  color: #52c41a;
}

.feedback-icon {
  font-size: 12px;
  font-weight: bold;
}

/* 密码强度 */
.password-strength {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 12px;
  background: var(--bg-soft);
  border-radius: 6px;
}

.strength-label {
  color: var(--text-muted);
  font-size: 14px;
  white-space: nowrap;
}

.strength-meter {
  flex: 1;
  height: 6px;
  background: var(--border);
  border-radius: 3px;
  overflow: hidden;
}

.strength-bar {
  height: 100%;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.strength-bar.weak {
  width: 30%;
  background: #f56c6c;
}

.strength-bar.medium {
  width: 60%;
  background: #e6a23c;
}

.strength-bar.strong {
  width: 90%;
  background: #52c41a;
}

.strength-text {
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  min-width: 60px;
}

/* 服务条款 */
.terms-agreement {
  margin-top: 20px;
  padding: 16px;
  background: var(--bg-soft);
  border-radius: 6px;
  border-left: 3px solid var(--brand-primary);
}

.terms-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
}

.terms-checkbox {
  margin-top: 2px;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.terms-text {
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.5;
}

.terms-link {
  color: var(--brand-primary);
  text-decoration: none;
  font-weight: 500;
}

.terms-link:hover {
  text-decoration: underline;
}

/* 表单操作 */
.form-actions {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid var(--border);
}

.btn-next, .btn-prev, .btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 28px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 180px;
}

.btn-next {
  background: linear-gradient(135deg, var(--brand-primary) 0%, #6aa3d6 100%);
  color: white;
  margin: 0 auto;
}

.btn-next:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(131, 183, 225, 0.3);
}

.btn-next:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.step-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn-prev {
  background: white;
  color: var(--text-muted);
  border: 1px solid var(--border);
}

.btn-prev:hover {
  background: #f8f9fa;
  border-color: var(--text-muted);
  transform: translateY(-1px);
}

.btn-submit {
  background: linear-gradient(135deg, var(--brand-primary) 0%, #6aa3d6 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(131, 183, 225, 0.2);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(131, 183, 225, 0.3);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-submit.loading {
  color: transparent;
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-icon {
  font-weight: bold;
}

/* 错误提示 */
.error-message {
  background: #fef0f0;
  border: 1px solid #f56c6c;
  border-radius: 6px;
  padding: 14px 18px;
  color: #f56c6c;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.error-icon {
  width: 20px;
  height: 20px;
  background: #f56c6c;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
  flex-shrink: 0;
}

/* 表单底部 */
.form-footer {
  text-align: center;
  padding-top: 30px;
  margin-top: 40px;
  border-top: 1px solid var(--border);
}

.form-footer p {
  color: var(--text-muted);
  font-size: 15px;
}

.login-link {
  color: var(--brand-primary);
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-link:hover {
  color: #6aa3d6;
  text-decoration: underline;
}

/* 信息区域 */
.info-section {
  flex: 1;
  background: linear-gradient(135deg, var(--brand-primary) 0%, #6aa3d6 100%);
  padding: 60px 40px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info-content {
  max-width: 500px;
  margin: 0 auto;
}

.info-header {
  margin-bottom: 60px;
}

.info-header h2 {
  font-size: 32px;
  font-weight: 800;
  line-height: 1.3;
  margin-bottom: 16px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.info-subtitle {
  font-size: 16px;
  opacity: 0.9;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.benefit-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(4px);
}

.benefit-icon {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  flex-shrink: 0;
}


.benefit-content h4 {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.benefit-content p {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .register-container {
    flex-direction: column;
    max-width: 800px;
  }
  
  .form-section {
    flex: 1;
    padding: 40px;
  }
  
  .info-section {
    padding: 40px;
  }
  
  .user-type-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .register-page {
    padding: 16px;
  }
  
  .form-section {
    padding: 32px 24px;
  }
  
  .info-section {
    padding: 32px 24px;
  }
  
  .form-header h1 {
    font-size: 28px;
  }
  
  .info-header h2 {
    font-size: 28px;
  }
  
  .step-indicator {
    margin: 30px 0 40px;
  }
  
  .step-number {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .step-buttons {
    flex-direction: column;
    gap: 12px;
  }
  
  .btn-next, .btn-prev, .btn-submit {
    width: 100%;
    min-width: unset;
  }
}

@media (max-width: 480px) {
  .form-section {
    padding: 24px 20px;
  }
  
  .info-section {
    padding: 24px 20px;
  }
  
  .user-type-grid {
    grid-template-columns: 1fr;
  }
  
  .form-header h1 {
    font-size: 24px;
  }
  
  .info-header h2 {
    font-size: 24px;
  }
  
  .benefit-item {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .decoration-shape {
    display: none;
  }
}
</style>