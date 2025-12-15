<template>
  <div class="activity-edit">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>{{ activityId ? '编辑活动' : '创建活动' }}</h1>
        <p class="header-subtitle">{{ activityId ? '修改活动信息' : '发布新的校园活动' }}</p>
      </div>
      <div class="header-actions">
        <button @click="$router.push('/admin/activities')" class="btn-secondary">
          活动管理
        </button>
        <button @click="$router.push('/activities')" class="btn-view">
          查看活动
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchActivity" class="btn-secondary">重试</button>
    </div>

    <!-- 编辑表单 -->
    <div v-else class="edit-form">
      <form @submit.prevent="submitForm">
        <!-- 基本信息 -->
        <div class="form-section">
          <div class="section-header">
            <h2>基本信息</h2>
          </div>
          
          <div class="form-group">
            <label class="form-label">活动标题 <span class="required-star">*</span></label>
            <input
              v-model="formData.title"
              type="text"
              placeholder="请输入活动标题"
              class="form-input"
              required
            >
          </div>

          <div class="form-group">
            <label class="form-label">活动描述 <span class="required-star">*</span></label>
            <textarea
              v-model="formData.description"
              placeholder="详细描述活动内容、流程和注意事项..."
              class="form-textarea"
              rows="4"
              required
            ></textarea>
          </div>
        </div>

        <!-- 组织信息 -->
        <div class="form-section">
          <div class="section-header">
            <h2>组织信息</h2>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">组织单位 <span class="required-star">*</span></label>
              <input
                v-model="formData.organizer"
                type="text"
                placeholder="请输入主办单位名称"
                class="form-input"
                required
              >
            </div>
            <div class="form-group">
              <label class="form-label">活动地点 <span class="required-star">*</span></label>
              <input
                v-model="formData.location"
                type="text"
                placeholder="请输入具体活动地点"
                class="form-input"
                required
              >
            </div>
          </div>
        </div>

        <!-- 时间设置 -->
        <div class="form-section">
          <div class="section-header">
            <h2>时间设置</h2>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">开始时间 <span class="required-star">*</span></label>
              <input
                v-model="formData.startTime"
                type="datetime-local"
                class="form-input"
                required
              >
            </div>
            <div class="form-group">
              <label class="form-label">结束时间 <span class="required-star">*</span></label>
              <input
                v-model="formData.endTime"
                type="datetime-local"
                class="form-input"
                required
              >
            </div>
          </div>
        </div>

        <!-- 人数设置 -->
        <div class="form-section">
          <div class="section-header">
            <h2>人数设置</h2>
          </div>
          
          <div class="form-group">
            <label class="form-label">最大参与人数</label>
            <input
              v-model="formData.maxParticipants"
              type="number"
              min="0"
              placeholder="0表示不限制人数"
              class="form-input"
            >
            <p class="input-hint">设置为 0 表示不限制参与人数</p>
          </div>
        </div>

        <!-- 状态设置 -->
        <div class="form-section">
          <div class="section-header">
            <h2>状态设置</h2>
          </div>
          
          <div class="status-options">
            <label class="status-option">
              <input
                type="radio"
                v-model="formData.status"
                value="DRAFT"
                class="radio-input"
              >
              <span class="option-label">草稿</span>
            </label>
            <label class="status-option">
              <input
                type="radio"
                v-model="formData.status"
                value="PUBLISHED"
                class="radio-input"
              >
              <span class="option-label">发布</span>
            </label>
            <label class="status-option" v-if="activityId">
              <input
                type="radio"
                v-model="formData.status"
                value="CANCELLED"
                class="radio-input"
              >
              <span class="option-label">取消</span>
            </label>
            <label class="status-option" v-if="activityId">
              <input
                type="radio"
                v-model="formData.status"
                value="COMPLETED"
                class="radio-input"
              >
              <span class="option-label">结束</span>
            </label>
          </div>
        </div>

        <!-- 表单操作 -->
        <div class="form-actions">
          <div class="action-buttons">
            <button type="submit" :disabled="submitting" class="btn-submit">
              {{ submitting ? '提交中...' : (activityId ? '更新活动' : '发布活动') }}
            </button>
            <button type="button" @click="$router.back()" class="btn-cancel">
              取消
            </button>
            <button 
              v-if="!activityId"
              type="button" 
              @click="saveDraft" 
              class="btn-draft"
              :disabled="submitting"
            >
              保存草稿
            </button>
          </div>
        </div>

        <!-- 表单验证错误 -->
        <div v-if="formError" class="form-error">
          {{ formError }}
        </div>
      </form>
    </div>

    <!-- 成功提示 -->
    <div v-if="showSuccess" class="success-modal" @click="closeSuccess">
      <div class="success-content">
        <h3>{{ activityId ? '更新成功' : '发布成功' }}</h3>
        <p>活动已{{ activityId ? '更新' : '发布' }}</p>
        <button @click="closeSuccess" class="btn-primary">确定</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const auth = useAuth()

const activityId = ref(route.params.id)
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const formError = ref('')
const showSuccess = ref(false)

const formData = reactive({
  title: '',
  description: '',
  organizer: '',
  location: '',
  startTime: '',
  endTime: '',
  maxParticipants: 0,
  status: 'DRAFT',
  currentParticipants: 0
})

const fetchActivity = async () => {
  if (!activityId.value) return
  
  loading.value = true
  error.value = ''
  
  try {
    const response = await axios.get(`/api/activities/${activityId.value}`)
    const activity = response.data
    
    // 填充表单数据
    Object.keys(formData).forEach(key => {
      if (activity[key] !== undefined && activity[key] !== null) {
        formData[key] = activity[key]
      }
    })
    
    // 格式化日期时间
    if (formData.startTime) {
      formData.startTime = formatDateTimeForInput(formData.startTime)
    }
    if (formData.endTime) {
      formData.endTime = formatDateTimeForInput(formData.endTime)
    }
    
  } catch (err) {
    console.error('加载活动数据失败:', err)
    error.value = '加载活动数据失败'
  } finally {
    loading.value = false
  }
}

const formatDateTimeForInput = (dateTime) => {
  const date = new Date(dateTime)
  return date.toISOString().slice(0, 16)
}

const validateForm = () => {
  if (!formData.title.trim()) {
    formError.value = '请输入活动标题'
    return false
  }
  if (!formData.description.trim()) {
    formError.value = '请输入活动描述'
    return false
  }
  if (!formData.organizer.trim()) {
    formError.value = '请输入组织单位'
    return false
  }
  if (!formData.location.trim()) {
    formError.value = '请输入活动地点'
    return false
  }
  if (!formData.startTime) {
    formError.value = '请选择开始时间'
    return false
  }
  if (!formData.endTime) {
    formError.value = '请选择结束时间'
    return false
  }
  
  const startTime = new Date(formData.startTime)
  const endTime = new Date(formData.endTime)
  
  if (endTime <= startTime) {
    formError.value = '结束时间必须晚于开始时间'
    return false
  }
  
  return true
}

const submitForm = async () => {
  if (!validateForm()) return
  
  await submitToServer()
}

const saveDraft = async () => {
  formData.status = 'DRAFT'
  await submitToServer()
}

const submitToServer = async () => {
  submitting.value = true
  formError.value = ''
  
  try {
    let response
    
    if (activityId.value) {
      // 更新活动
      response = await axios.put(`/api/activities/${activityId.value}`, formData)
    } else {
      // 创建活动
      response = await axios.post('/api/activities', formData)
    }
    
    showSuccess.value = true
    
  } catch (err) {
    console.error('提交失败:', err)
    formError.value = err.response?.data || err.message || '操作失败'
  } finally {
    submitting.value = false
  }
}

const closeSuccess = () => {
  showSuccess.value = false
  router.push('/admin/activities')
}

onMounted(() => {
  if (activityId.value) {
    fetchActivity()
  }
})
</script>

<style scoped>

/* 修复页面背景色 */
.page-container {
  background: white !important;
  background-color: white !important;
}

.activity-edit {
  min-height: 100vh;
  background: #f8fafc;
  padding: 20px;
  font-family: 'Segoe UI', system-ui, sans-serif;
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

.header-content h1 {
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px 0;
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

.btn-secondary, .btn-view {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  min-width: 100px;
}

.btn-secondary {
  background: var(--brand-highlight);
  color: #222;
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: #f3db60;
}

.btn-view {
  background: var(--brand-primary);
  color: white;
}

.btn-view:hover {
  background: #6aa3d6;
}

/* 状态指示器 */
.loading-state, .error-state {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border);
  border-top: 3px solid var(--brand-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state p {
  color: #f56c6c;
  margin: 0 0 16px 0;
  font-size: 15px;
}

/* 编辑表单 */
.edit-form {
  max-width: 1000px;
  margin: 0 auto;
}

.form-section {
  background: white;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  border: 1px solid var(--border);
}

.section-header {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.section-header h2 {
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}

/* 表单控件 */
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 14px;
}

.required-star {
  color: #f56c6c;
  font-weight: bold;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
  line-height: 1.5;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px rgba(131, 183, 225, 0.2);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.input-hint {
  color: var(--text-muted);
  font-size: 12px;
  margin-top: 6px;
  margin-left: 4px;
}

/* 状态选项 */
.status-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.status-option {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.radio-input {
  margin: 0;
}

.option-label {
  color: var(--text-primary);
  font-size: 14px;
}

/* 表单操作 */
.form-actions {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-submit, .btn-cancel, .btn-draft {
  padding: 10px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  min-width: 120px;
}

.btn-submit {
  background: var(--brand-primary);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #6aa3d6;
}

.btn-cancel {
  background: white;
  color: var(--text-muted);
  border: 1px solid var(--border);
}

.btn-cancel:hover {
  background: #f8f9fa;
  border-color: var(--text-muted);
}

.btn-draft {
  background: var(--brand-highlight);
  color: #222;
  border: 1px solid var(--border);
}

.btn-draft:hover:not(:disabled) {
  background: #f3db60;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 错误消息 */
.form-error {
  margin-top: 16px;
  padding: 12px 16px;
  background: #fef0f0;
  border: 1px solid #f56c6c;
  border-radius: 4px;
  color: #f56c6c;
  text-align: center;
  font-size: 14px;
}

/* 成功模态框 */
.success-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.success-content {
  background: white;
  border-radius: 6px;
  padding: 32px 40px;
  text-align: center;
  max-width: 300px;
  width: 90%;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.success-content h3 {
  color: var(--text-primary);
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 700;
}

.success-content p {
  color: var(--text-muted);
  margin: 0 0 24px 0;
  font-size: 14px;
}

.btn-primary {
  background: var(--brand-primary);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.btn-primary:hover {
  background: #6aa3d6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .activity-edit {
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
  
  .btn-secondary, .btn-view {
    flex: 1;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn-submit, .btn-cancel, .btn-draft {
    width: 100%;
  }
  
  .status-options {
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .activity-edit {
    padding: 12px;
  }
  
  .header-content h1 {
    font-size: 20px;
  }
  
  .form-section {
    padding: 16px;
  }
  
  .success-content {
    padding: 24px 20px;
  }
}
</style>