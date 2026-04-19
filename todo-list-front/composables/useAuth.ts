import { ElMessage } from 'element-plus'
import { encrypt } from '~/utils/crypto'
import { useAuthStore } from '~/stores/auth'
import { request } from '~/utils/request'

export function useAuth() {
  const authStore = useAuthStore()

  // 登录
  const login = async (username: string, password: string) => {
    if (!username || !password) {
      ElMessage.warning('请输入用户名和密码！')
      return null
    }

    try {
      const res: any = await request('/login', {
        method: 'POST',
        body: {
          username,
          password: encrypt(password),
        },
      })

      if (res.code === 200) {
        authStore.setToken(res.data.token)
        ElMessage.success('登录成功！')
        return res.data.token
      } else {
        ElMessage.error(res.msg || '登录失败！')
        return null
      }
    } catch (err) {
      ElMessage.error('网络异常或服务器错误')
      return null
    }
  }

  // 注册
  const register = async (username: string, password: string) => {
    if (!username || !password) {
      ElMessage.warning('请输入用户名和密码！')
      return false
    }

    try {
      const res: any = await request('/register', {
        method: 'POST',
        body: {
          username,
          password: encrypt(password),
        },
      })

      if (res.code === 200) {
        ElMessage.success('注册成功！')
        return true
      } else {
        ElMessage.error(res.msg || '注册失败')
        return false
      }
    } catch (err) {
      ElMessage.error('网络异常或服务器错误')
      return false
    }
  }

  // 退出
  const logout = () => {
    authStore.clearToken()
    ElMessage.success('已退出登录')
  }

  return {
    login,
    register,
    logout,
  }
}