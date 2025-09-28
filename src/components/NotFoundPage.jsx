import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Home, MessageCircle, Search } from 'lucide-react'

const NotFoundPage = () => {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Verificar se é um link de mensagem mal formado e tentar redirecionar
    const path = location.pathname
    
    // Se parece com um link de usuário, tentar extrair o username
    if (path.includes('/message/') || path.startsWith('/')) {
      const possibleUsername = path.replace('/message/', '').replace('/', '')
      
      if (possibleUsername && possibleUsername.length > 0) {
        // Redirecionar para a página de mensagem correta após um delay
        setTimeout(() => {
          navigate(`/message/${possibleUsername}`)
        }, 2000)
      }
    }
  }, [location, navigate])

  const handleGoHome = () => {
    navigate('/')
  }

  const handleCreateAccount = () => {
    navigate('/register')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <Card className="bg-gray-900/80 border-yellow-400/30 backdrop-blur-sm max-w-md w-full">
        <CardContent className="p-8 text-center">
          {/* Ícone */}
          <div className="w-20 h-20 mx-auto border-3 border-yellow-400 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-xl mb-6">
            <Search className="w-10 h-10 text-black" />
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-4">
            Página não encontrada
          </h1>

          {/* Descrição */}
          <p className="text-gray-300 mb-6 leading-relaxed">
            Ops! Parece que você está tentando acessar um link que não existe ou foi digitado incorretamente.
          </p>

          {/* Verificando redirecionamento */}
          {location.pathname.includes('/message/') && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center text-yellow-400 mb-2">
                <MessageCircle className="w-4 h-4 mr-2" />
                <span className="font-semibold">Tentando redirecionar...</span>
              </div>
              <p className="text-yellow-200 text-sm">
                Detectamos que você está tentando acessar uma página de mensagem. 
                Redirecionando automaticamente...
              </p>
            </div>
          )}

          {/* Botões de ação */}
          <div className="space-y-3">
            <Button
              onClick={handleGoHome}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold py-3"
            >
              <Home className="w-4 h-4 mr-2" />
              Ir para página inicial
            </Button>

            <Button
              onClick={handleCreateAccount}
              variant="outline"
              className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Criar minha conta
            </Button>
          </div>

          {/* Informação adicional */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>Se você chegou aqui através de um link compartilhado,</p>
            <p>verifique se o link está correto ou entre em contato com quem compartilhou.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default NotFoundPage
