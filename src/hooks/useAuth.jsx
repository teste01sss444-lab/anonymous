import React, { createContext, useContext, useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há um usuário logado ao carregar a página
    const savedUser = Cookies.get('anonymous_user')
    const savedUserLocal = localStorage.getItem('anonymous_current_user')
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Erro ao carregar usuário do cookie:', error)
        Cookies.remove('anonymous_user')
      }
    } else if (savedUserLocal) {
      try {
        const userData = JSON.parse(savedUserLocal)
        setUser(userData)
        // Restaurar cookie também
        Cookies.set('anonymous_user', savedUserLocal, { expires: 7 })
      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage:', error)
        localStorage.removeItem('anonymous_current_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      // Buscar usuário no Supabase
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single()
      
      if (error || !users) {
        throw new Error('Usuário ou senha incorretos')
      }
      
      const userData = {
        id: users.id,
        username: users.username,
        createdAt: users.created_at
      }
      
      setUser(userData)
      Cookies.set('anonymous_user', JSON.stringify(userData), { expires: 7 })
      localStorage.setItem('anonymous_current_user', JSON.stringify(userData))
      
      return true
    } catch (error) {
      console.error('Erro no login:', error)
      
      // Fallback para localStorage se Supabase falhar
      const users = JSON.parse(localStorage.getItem('anonymous_users') || '[]')
      const existingUser = users.find(u => u.username === username && u.password === password)
      
      if (existingUser) {
        const userData = {
          id: existingUser.id,
          username: existingUser.username,
          createdAt: existingUser.createdAt
        }
        setUser(userData)
        Cookies.set('anonymous_user', JSON.stringify(userData), { expires: 7 })
        localStorage.setItem('anonymous_current_user', JSON.stringify(userData))
        return true
      }
      
      throw error
    }
  }

  const register = async (username, password) => {
    try {
      // Simular registro
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Verificar se usuário já existe
      const users = JSON.parse(localStorage.getItem('anonymous_users') || '[]')
      const existingUser = users.find(u => u.username === username)
      
      if (existingUser) {
        throw new Error('Usuário já existe')
      }
      
      // Criar novo usuário
      const newUser = {
        id: Date.now(),
        username,
        password,
        createdAt: new Date().toISOString()
      }
      
      users.push(newUser)
      localStorage.setItem('anonymous_users', JSON.stringify(users))
      
      // Fazer login automático
      const userData = {
        id: newUser.id,
        username: newUser.username,
        createdAt: newUser.createdAt
      }
      
      setUser(userData)
      Cookies.set('anonymous_user', JSON.stringify(userData), { expires: 7 })
      localStorage.setItem('anonymous_current_user', JSON.stringify(userData))
      
      return true
    } catch (error) {
      console.error('Erro no registro:', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    Cookies.remove('anonymous_user')
    localStorage.removeItem('anonymous_current_user')
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
