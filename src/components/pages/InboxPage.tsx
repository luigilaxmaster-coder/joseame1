import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMember } from '@/integrations';
import { useRoleStore } from '@/store/roleStore';
import { ArrowLeft, MessageSquare, Send, User, DollarSign, CheckCircle, X, AlertCircle, Clock } from 'lucide-react';

interface Chat {
  id: string;
  name: string;
  jobTitle: string;
  lastMessage: string;
  time: string;
  unread: number;
  otherUserId: string;
  avatar?: string;
}

interface Message {
  id: string;
  sender: 'me' | 'other';
  text: string;
  time: string;
}

interface PendingRequest {
  id: string;
  type: 'completion' | 'renegotiate';
  title: string;
  expiresIn: number; // seconds
}

export default function InboxPage() {
  const { member } = useMember();
  const { userRole } = useRoleStore();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingRequest, setPendingRequest] = useState<PendingRequest | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    loadChats();
  }, [member]);

  useEffect(() => {
    if (!pendingRequest) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setPendingRequest(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pendingRequest]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const mockChats: Chat[] = [
        {
          id: '1',
          name: 'Juan Pérez',
          jobTitle: 'Reparación de tubería',
          lastMessage: 'Perfecto, nos vemos mañana',
          time: '10:30 AM',
          unread: 2,
          otherUserId: 'user-1'
        },
        {
          id: '2',
          name: 'María González',
          jobTitle: 'Instalación eléctrica',
          lastMessage: '¿A qué hora puedes venir?',
          time: 'Ayer',
          unread: 0,
          otherUserId: 'user-2'
        },
        {
          id: '3',
          name: 'Carlos López',
          jobTitle: 'Pintura de casa',
          lastMessage: 'El trabajo está casi listo',
          time: 'Hace 2h',
          unread: 1,
          otherUserId: 'user-3'
        }
      ];
      setChats(mockChats);
      setSelectedChat('1');
      setPendingRequest({
        id: '1',
        type: 'completion',
        title: 'Confirmar trabajo completado',
        expiresIn: 300
      });
      setCountdown(300);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const messages = selectedChat ? [
    { id: '1', sender: 'other' as const, text: 'Hola, estoy interesado en el trabajo', time: '9:00 AM' },
    { id: '2', sender: 'me' as const, text: 'Perfecto, ¿cuándo puedes empezar?', time: '9:15 AM' },
    { id: '3', sender: 'other' as const, text: 'Puedo empezar mañana por la mañana', time: '9:30 AM' },
    { id: '4', sender: 'me' as const, text: 'Perfecto, nos vemos mañana', time: '10:30 AM' }
  ] : [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setMessage('');
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBackLink = () => {
    return userRole === 'joseador' ? '/joseador/dashboard' : '/client/dashboard';
  };

  const selectedChatData = chats.find(c => c.id === selectedChat);

  // Render different message styles based on user role
  const renderMessage = (msg: Message) => {
    const isMyMessage = msg.sender === 'me';
    
    if (userRole === 'joseador') {
      // Joseador-specific styling with green gradient
      return (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[65%] rounded-2xl px-4 py-3 ${
              isMyMessage
                ? 'bg-gradient-to-r from-secondary to-accent text-white shadow-md'
                : 'bg-[#e8e8e8] text-foreground border border-border'
            }`}
          >
            <p className="font-paragraph text-sm">{msg.text}</p>
            <p className={`font-paragraph text-xs mt-1.5 ${
              isMyMessage ? 'text-white/70' : 'text-muted-text'
            }`}>
              {msg.time}
            </p>
          </div>
        </motion.div>
      );
    } else {
      // Client-specific styling with primary blue
      return (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[65%] rounded-2xl px-4 py-3 ${
              isMyMessage
                ? 'bg-primary text-white'
                : 'bg-[#e8e8e8] text-foreground'
            }`}
          >
            <p className="font-paragraph text-sm">{msg.text}</p>
            <p className={`font-paragraph text-xs mt-1.5 ${
              isMyMessage ? 'text-white/70' : 'text-muted-text'
            }`}>
              {msg.time}
            </p>
          </div>
        </motion.div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-[120rem] mx-auto px-6 py-4">
          <Link to={getBackLink()} className="inline-flex items-center gap-2 text-muted-text hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
            <span className="font-paragraph text-sm">Volver</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[120rem] mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="h-[calc(100vh-180px)]"
        >
          <h1 className="font-heading text-5xl font-bold text-foreground mb-8">
            Mis Mensajes
          </h1>

          <div className="flex gap-6 h-[calc(100vh-280px)]">
            {/* Chat List - 25-30% */}
            <div className="w-[28%] bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-border">
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  Conversaciones
                </h2>
              </div>
              <div className="overflow-y-auto flex-1">
                {loading ? (
                  <div className="p-4 text-center">
                    <p className="font-paragraph text-sm text-muted-text">Cargando...</p>
                  </div>
                ) : chats.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="font-paragraph text-sm text-muted-text">No tienes conversaciones</p>
                  </div>
                ) : (
                  chats.map((chat) => (
                    <motion.div
                      key={chat.id}
                      whileHover={{ backgroundColor: selectedChat === chat.id ? undefined : '#fafafa' }}
                      onClick={() => setSelectedChat(chat.id)}
                      className={`p-4 border-b border-border cursor-pointer transition-all ${
                        selectedChat === chat.id 
                          ? 'bg-primary/8 border-l-4 border-l-primary' 
                          : 'hover:bg-[#fafafa]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                          <User size={22} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-heading font-semibold text-foreground text-sm truncate">
                              {chat.name}
                            </h3>
                            <span className="font-paragraph text-xs text-muted-text flex-shrink-0 ml-2">
                              {chat.time}
                            </span>
                          </div>
                          <p className="font-paragraph text-xs text-primary mb-1 truncate">
                            {chat.jobTitle}
                          </p>
                          <p className="font-paragraph text-xs text-muted-text truncate">
                            {chat.lastMessage}
                          </p>
                        </div>
                        {chat.unread > 0 && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 rounded-full bg-accent flex items-center justify-center flex-shrink-0"
                          >
                            <span className="font-paragraph text-xs text-white font-bold">
                              {chat.unread}
                            </span>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Window - 70-75% */}
            <div className="flex-1 bg-white rounded-2xl border border-border shadow-sm flex flex-col overflow-hidden">
              {selectedChat && selectedChatData ? (
                <>
                  {/* Chat Header */}
                  <div className="p-5 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <User size={22} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold text-foreground text-base">
                          {selectedChatData.name}
                        </h3>
                        <p className="font-paragraph text-xs text-muted-text">
                          {selectedChatData.jobTitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Bar - Sticky */}
                  <div className="px-5 py-3 bg-[#f9f9f9] border-b border-border flex gap-2">
                    {userRole === 'joseador' ? (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-secondary to-accent text-white rounded-lg font-paragraph text-sm font-medium hover:shadow-md transition-all"
                        >
                          <Clock size={16} />
                          Proponer horario
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-border rounded-lg font-paragraph text-sm font-medium text-foreground hover:bg-[#f5f5f5] transition-colors"
                        >
                          <AlertCircle size={16} />
                          Reportar problema
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-destructive rounded-lg font-paragraph text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
                        >
                          <X size={16} />
                          Rechazar trabajo
                        </motion.button>
                      </>
                    ) : (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-border rounded-lg font-paragraph text-sm font-medium text-foreground hover:bg-[#f5f5f5] transition-colors"
                        >
                          <DollarSign size={16} />
                          Renegociar precio
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-paragraph text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                          <CheckCircle size={16} />
                          Trabajo completado
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-destructive rounded-lg font-paragraph text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
                        >
                          <X size={16} />
                          Cancelar joseo
                        </motion.button>
                      </>
                    )}
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#fafafa]">
                    {messages.map((msg) => renderMessage(msg))}
                  </div>

                  {/* Pending Request Banner - Sticky */}
                  {pendingRequest && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="px-5 py-4 bg-primary/5 border-t border-primary/20 border-b border-primary/20"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-heading text-sm font-semibold text-foreground mb-1">
                            {pendingRequest.title}
                          </p>
                          <p className="font-paragraph text-xs text-muted-text">
                            Expira en: <span className="font-semibold text-primary">{formatCountdown(countdown)}</span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-primary text-white rounded-lg font-paragraph text-xs font-semibold hover:bg-primary/90 transition-colors"
                          >
                            Aceptar
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setPendingRequest(null)}
                            className="px-4 py-2 bg-white border border-border text-foreground rounded-lg font-paragraph text-xs font-semibold hover:bg-[#f5f5f5] transition-colors"
                          >
                            Rechazar
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-5 border-t border-border bg-white">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 px-4 py-3 border border-border rounded-xl font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="px-5 py-3 bg-primary text-white rounded-xl font-paragraph font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
                      >
                        <Send size={18} />
                      </motion.button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare size={64} className="text-muted-text mx-auto mb-4" />
                    <p className="font-paragraph text-muted-text">
                      Selecciona una conversación para empezar
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
