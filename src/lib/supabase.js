import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://aglhpcchpffkogwbnhvf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnbGhwY2NocGZma29nd2JuaHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODY4NzksImV4cCI6MjA3NDU2Mjg3OX0.Eyo_fs_kdCH5ArjROWRTGygibyziQAGtGkRHDwYw62w'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Função para inicializar tabelas
export const initializeTables = async () => {
  try {
    // Criar tabela de usuários
    const { error: usersError } = await supabase.rpc('create_users_table')
    
    // Criar tabela de mensagens
    const { error: messagesError } = await supabase.rpc('create_messages_table')
    
    // Criar tabela de pagamentos
    const { error: paymentsError } = await supabase.rpc('create_payments_table')
    
    console.log('Tabelas inicializadas')
  } catch (error) {
    console.log('Tabelas já existem ou erro:', error)
  }
}
