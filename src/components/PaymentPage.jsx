import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Eye, 
  ArrowLeft, 
  CreditCard, 
  Shield, 
  CheckCircle,
  User,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react'

const PaymentPage = () => {
  const { messageId } = useParams()
  const navigate = useNavigate()
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [revealedInfo, setRevealedInfo] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [pixQRCode, setPixQRCode] = useState('')
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    email: '',
    cardType: 'credit'
  })

  useEffect(() => {
    loadMessage()
  }, [messageId])

  const loadMessage = async () => {
    try {
      // Simular carregamento da mensagem
      setTimeout(() => {
        setMessage({
          id: messageId,
          content: "Oi! Você é muito legal, queria te conhecer melhor 😊",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          revealed: false
        })
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Erro ao carregar mensagem:', error)
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    let { name, value } = e.target
    
    // Formatação automática para campos específicos
    if (name === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
      value = value.substring(0, 19) // Limitar a 16 dígitos + espaços
    } else if (name === 'expiryDate') {
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2')
      value = value.substring(0, 5) // MM/YY
    } else if (name === 'cvv') {
      value = value.replace(/\D/g, '').substring(0, 4)
    }
    
    setPaymentData({
      ...paymentData,
      [name]: value
    })
  }

  const generatePixQRCode = async () => {
    try {
      // Usar BSPAY para gerar PIX real
      const bspayService = (await import('../lib/bspay')).default
      
      const paymentData = await bspayService.createPixPayment(5.00, 'Revelar identidade - Anonymous', {
        name: 'Gabriel de Lima Oliveira',
        email: 'gabriellima5494@gmail.com',
        cpf: '11003355366',
        messageId: messageId,
        userId: 'user_' + Date.now()
      })
      
      if (paymentData.success) {
        setPixQRCode(paymentData.pix_code)
        return paymentData.pix_code
      }
    } catch (error) {
      console.error('Erro ao gerar PIX:', error)
    }
    
    // Fallback para código simulado
    const pixCode = `00020126580014br.gov.bcb.pix0136${Date.now()}@anonymous.com5204000053039865802BR5913ANONYMOUS APP6009SAO PAULO62070503***6304`
    setPixQRCode(pixCode)
    return pixCode
  }

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method)
    setShowPaymentForm(true)
    
    if (method === 'pix') {
      generatePixQRCode()
    }
  }

  const generateRandomSender = () => {
    const maleNames = [
      'João Silva', 'Pedro Santos', 'Carlos Oliveira', 'Rafael Costa', 'Lucas Ferreira',
      'Gabriel Almeida', 'Bruno Rodrigues', 'Mateus Lima', 'André Souza', 'Felipe Martins'
    ]
    
    const femaleNames = [
      'Maria Silva', 'Ana Santos', 'Juliana Oliveira', 'Camila Costa', 'Larissa Ferreira',
      'Beatriz Almeida', 'Fernanda Rodrigues', 'Gabriela Lima', 'Carolina Souza', 'Amanda Martins'
    ]
    
    const cities = [
      { city: 'Fortaleza', state: 'CE' },
      { city: 'Recife', state: 'PE' },
      { city: 'Salvador', state: 'BA' },
      { city: 'Teresina', state: 'PI' },
      { city: 'São Luís', state: 'MA' },
      { city: 'Maceió', state: 'AL' },
      { city: 'Aracaju', state: 'SE' },
      { city: 'João Pessoa', state: 'PB' },
      { city: 'Natal', state: 'RN' }
    ]
    
    const allNames = [...maleNames, ...femaleNames]
    const randomName = allNames[Math.floor(Math.random() * allNames.length)]
    const randomLocation = cities[Math.floor(Math.random() * cities.length)]
    
    return {
      name: randomName,
      city: randomLocation.city,
      state: randomLocation.state
    }
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    setProcessing(true)

    try {
      const bspayService = (await import('../lib/bspay')).default
      
      if (paymentMethod === 'pix') {
        // PIX já foi gerado, simular confirmação
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Em produção, verificar status via webhook
        const senderInfo = generateRandomSender()
        setRevealedInfo(senderInfo)
        setPaymentSuccess(true)
        
      } else {
        // Processar pagamento com cartão via BSPAY
        const cardPayment = await bspayService.createCardPayment(5.00, {
          number: paymentData.cardNumber.replace(/\s/g, ''),
          expMonth: paymentData.expiryDate.split('/')[0],
          expYear: '20' + paymentData.expiryDate.split('/')[1],
          cvc: paymentData.cvv,
          holderName: paymentData.name
        }, {
          name: paymentData.name,
          email: paymentData.email,
          cpf: '11003355366',
          messageId: messageId,
          userId: 'user_' + Date.now()
        })
        
        if (cardPayment.success) {
          const senderInfo = generateRandomSender()
          setRevealedInfo(senderInfo)
          setPaymentSuccess(true)
        } else {
          throw new Error('Pagamento recusado')
        }
      }
      
    } catch (error) {
      console.error('Erro no pagamento:', error)
      alert('Erro ao processar pagamento. Tente novamente.')
    } finally {
      setProcessing(false)
    }
  }

  const formatTime = (date) => {
    const now = new Date()
    const diff = now - date
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days > 0) return `${days}d atrás`
    if (hours > 0) return `${hours}h atrás`
    return 'Agora mesmo'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Carregando mensagem...</p>
        </div>
      </div>
    )
  }

  if (paymentSuccess && revealedInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
        <div className="max-w-2xl mx-auto">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center text-yellow-400 hover:text-yellow-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao dashboard
          </Link>

          <Card className="bg-gray-900/80 border-green-500/30 backdrop-blur-sm mb-6">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-green-400 mb-2">Pagamento Confirmado!</h2>
              <p className="text-gray-300 mb-6">
                A identidade do remetente foi revelada com sucesso.
              </p>
            </CardContent>
          </Card>

          {/* Mensagem Original */}
          <Card className="bg-gray-900/80 border-gray-600 mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">Mensagem Original</CardTitle>
                <div className="flex items-center text-gray-400 text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatTime(message.createdAt)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white text-lg leading-relaxed mb-4">
                "{message.content}"
              </p>
            </CardContent>
          </Card>

          {/* Informações Reveladas */}
          <Card className="bg-gradient-to-r from-green-900/50 to-green-800/50 border-green-500/50">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Remetente Revelado
              </CardTitle>
              <CardDescription className="text-green-200">
                Informações do usuário que enviou esta mensagem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-green-900/30 rounded-lg border border-green-500/30">
                  <User className="w-6 h-6 text-green-400 mr-3" />
                  <div>
                    <p className="text-sm text-green-200">Nome</p>
                    <p className="text-lg font-semibold text-white">{revealedInfo.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 bg-green-900/30 rounded-lg border border-green-500/30">
                  <MapPin className="w-6 h-6 text-green-400 mr-3" />
                  <div>
                    <p className="text-sm text-green-200">Localização</p>
                    <p className="text-lg font-semibold text-white">
                      {revealedInfo.city} - {revealedInfo.state}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center text-yellow-400 mb-2">
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span className="font-semibold">Informação Importante</span>
                </div>
                <p className="text-yellow-200 text-sm">
                  Estas informações são geradas aleatoriamente para preservar a privacidade real dos usuários, 
                  mas representam dados plausíveis da região Nordeste do Brasil.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <Link to="/dashboard">
              <Button className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold px-8 py-3">
                Ver Todas as Mensagens
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <div className="max-w-2xl mx-auto">
        <Link 
          to="/dashboard" 
          className="inline-flex items-center text-yellow-400 hover:text-yellow-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao dashboard
        </Link>

        {/* Mensagem a ser revelada */}
        <Card className="bg-gray-900/80 border-gray-600 mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">Mensagem Anônima</CardTitle>
              <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                <Eye className="w-3 h-3 mr-1" />
                Não revelado
              </Badge>
            </div>
            <div className="flex items-center text-gray-400 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              {formatTime(message.createdAt)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-white text-lg leading-relaxed mb-4">
              "{message.content}"
            </p>
            <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-lg">
              <div className="flex items-center text-yellow-400 mb-2">
                <Eye className="w-5 h-5 mr-2" />
                <span className="font-semibold">Descubra quem mandou essa mensagem!</span>
              </div>
              <p className="text-yellow-200">
                Por apenas <strong>R$ 5,00</strong>, você pode revelar a identidade de quem enviou esta mensagem.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Seleção de Método de Pagamento */}
        {!showPaymentForm ? (
          <Card className="bg-gray-900/80 border-yellow-400/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Revelar Identidade - R$ 5,00
              </CardTitle>
              <CardDescription className="text-gray-300">
                Escolha sua forma de pagamento preferida
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-white font-semibold mb-4">Escolha como pagar:</h3>
                
                <div className="grid gap-3">
                  <Button
                    onClick={() => handlePaymentMethodSelect('pix')}
                    variant="outline"
                    className="h-16 border-2 border-green-500/50 hover:border-green-400 hover:bg-green-500/10 text-left justify-start"
                  >
                    <div className="flex items-center w-full">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                        <span className="text-white font-bold text-sm">PIX</span>
                      </div>
                      <div>
                        <div className="text-white font-semibold">PIX</div>
                        <div className="text-gray-400 text-sm">Pagamento instantâneo</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => handlePaymentMethodSelect('credit')}
                    variant="outline"
                    className="h-16 border-2 border-blue-500/50 hover:border-blue-400 hover:bg-blue-500/10 text-left justify-start"
                  >
                    <div className="flex items-center w-full">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">Cartão de Crédito</div>
                        <div className="text-gray-400 text-sm">Visa, Mastercard, Elo</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => handlePaymentMethodSelect('debit')}
                    variant="outline"
                    className="h-16 border-2 border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/10 text-left justify-start"
                  >
                    <div className="flex items-center w-full">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">Cartão de Débito</div>
                        <div className="text-gray-400 text-sm">Débito direto da conta</div>
                      </div>
                    </div>
                  </Button>
                </div>
                
                <div className="mt-6 flex items-center justify-center text-sm text-gray-400">
                  <Shield className="w-4 h-4 mr-2" />
                  <span>Pagamento 100% seguro e criptografado</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : paymentMethod === 'pix' ? (
          /* Formulário PIX */
          <Card className="bg-gray-900/80 border-green-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center">
                <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-xs">PIX</span>
                </div>
                Pagamento PIX - R$ 5,00
              </CardTitle>
              <CardDescription className="text-gray-300">
                Escaneie o QR Code ou copie o código PIX
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                {/* QR Code simulado */}
                <div className="bg-white p-6 rounded-lg text-center">
                  <div className="w-48 h-48 mx-auto bg-black rounded-lg flex items-center justify-center mb-4">
                    <div className="text-white text-xs text-center">
                      QR CODE PIX<br/>
                      R$ 5,00<br/>
                      ANONYMOUS
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">Escaneie com seu app do banco</p>
                </div>
                
                {/* PIX Copia e Cola */}
                <div className="bg-green-900/20 border-2 border-green-500/50 rounded-lg p-6">
                  <div className="text-center mb-4">
                    <h3 className="text-green-400 font-bold text-lg mb-2">PIX COPIA E COLA</h3>
                    <p className="text-green-200 text-sm">Copie o código abaixo e cole no seu app do banco</p>
                  </div>
                  
                  <div className="bg-gray-800 p-4 rounded-lg border border-green-500/30 mb-4">
                    <div className="text-white text-xs font-mono break-all leading-relaxed">
                      {pixQRCode}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(pixQRCode)
                      alert('✅ Código PIX copiado!\n\nAgora cole no seu app do banco para pagar.')
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 text-lg"
                  >
                    📋 COPIAR CÓDIGO PIX
                  </Button>
                  
                  <div className="mt-4 text-center">
                    <p className="text-green-200 text-sm">
                      💡 <strong>Dica:</strong> Após copiar, abra seu app do banco e procure por "PIX" → "Pagar" → "Colar código"
                    </p>
                  </div>
                </div>
                
                <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-lg">
                  <h4 className="text-green-400 font-semibold mb-2">Como pagar:</h4>
                  <ol className="text-green-200 text-sm space-y-1">
                    <li>1. Abra o app do seu banco</li>
                    <li>2. Escaneie o QR Code ou cole o código PIX</li>
                    <li>3. Confirme o pagamento de R$ 5,00</li>
                    <li>4. A identidade será revelada automaticamente</li>
                  </ol>
                </div>
                
                <Button
                  onClick={() => {
                    setProcessing(true)
                    setTimeout(() => {
                      const senderInfo = generateRandomSender()
                      setRevealedInfo(senderInfo)
                      setPaymentSuccess(true)
                      setProcessing(false)
                    }, 3000)
                  }}
                  disabled={processing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3"
                >
                  {processing ? 'Aguardando pagamento...' : 'Simular Pagamento PIX'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Formulário de Cartão */
          <Card className="bg-gray-900/80 border-yellow-400/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                {paymentMethod === 'credit' ? 'Cartão de Crédito' : 'Cartão de Débito'} - R$ 5,00
              </CardTitle>
              <CardDescription className="text-gray-300">
                Preencha os dados do cartão para revelar a identidade
              </CardDescription>
            </CardHeader>
            
            <CardContent>
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    variant="ghost"
                    className="text-gray-400 hover:text-white mb-4"
                  >
                    ← Voltar para seleção de pagamento
                  </Button>
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="name" className="text-gray-300">Nome no cartão</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={paymentData.name}
                    onChange={handleInputChange}
                    placeholder="Nome completo"
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="cardNumber" className="text-gray-300">Número do cartão</Label>
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    type="text"
                    value={paymentData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="expiryDate" className="text-gray-300">Validade</Label>
                  <Input
                    id="expiryDate"
                    name="expiryDate"
                    type="text"
                    value={paymentData.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/AA"
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="cvv" className="text-gray-300">CVV</Label>
                  <Input
                    id="cvv"
                    name="cvv"
                    type="text"
                    value={paymentData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="email" className="text-gray-300">E-mail para recibo</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={paymentData.email}
                    onChange={handleInputChange}
                    placeholder="seu@email.com"
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400"
                    required
                  />
                </div>
              </div>

              {/* Resumo do Pagamento */}
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Revelação de identidade</span>
                  <span className="text-white font-semibold">R$ 5,00</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-yellow-400">Total</span>
                  <span className="text-yellow-400">R$ 5,00</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={processing}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold py-4 text-lg"
              >
                {processing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                    Processando pagamento...
                  </div>
                ) : (
                  <>
                    <Eye className="w-5 h-5 mr-2" />
                    REVELAR IDENTIDADE - R$ 5,00
                  </>
                )}
              </Button>
              {/* Segurança */}
              <div className="mt-6 flex items-center justify-center text-sm text-gray-400">
                <Shield className="w-4 h-4 mr-2" />
                <span>Pagamento 100% seguro e criptografado</span>
              </div>
            </form>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  )
}

export default PaymentPage
