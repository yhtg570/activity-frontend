<template>
  <div>
    <h2>前后端连接测试</h2>
    <button @click="testConnection">测试连接</button>
    <p>{{ message }}</p>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      message: ''
    }
  },
  methods: {
    async testConnection() {
      try {
        const response = await axios.get('/activities')
        this.message = '连接成功！数据：' + JSON.stringify(response.data)
      } catch (error) {
        this.message = '连接失败：' + error.message
      }
    }
  }
}
</script>