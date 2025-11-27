import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMember } from '@/integrations';
import { useRoleStore } from '@/store/roleStore';
import { 
  ArrowLeft, MessageSquare, Send, User, DollarSign, CheckCircle, X, AlertCircle, Clock, 
  Info, Briefcase, Star, Zap, Phone, Mail, TrendingUp, Shield, Heart, MessageCircle, 
  Calendar, MapPin, Sparkles
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Image } from '@/components/ui/image';

interface Chat {
  id: string;
  name: string;
  jobTitle: string;
  lastMessage: string;
  time: string;
  unread: number;
  otherUserId: string;
  avatar?: string;
  status?: 'active' | 'pending' | 'completed';
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
  expiresIn: number;
}

interface UserInfo {
  name: string;
  email: string;
  phone?: string;
  photo?: string;
  rating?: number;
  jobsCompleted?: number;
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
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUserInfo, setSelectedUserInfo] = useState<UserInfo | null>(null);

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
          otherUserId: 'user-1',
          status: 'pending'
        },
        {
          id: '2',
          name: 'María González',
          jobTitle: 'Instalación eléctrica',
          lastMessage: '¿A qué hora puedes venir?',
          time: 'Ayer',
          unread: 0,
          otherUserId: 'user-2',
          status: 'active'
        },
        {
          id: '3',
          name: 'Carlos López',
          jobTitle: 'Pintura de casa',
          lastMessage: 'El trabajo está casi listo',
          time: 'Hace 2h',
          unread: 1,
          otherUserId: 'user-3',
          status: 'completed'
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

  const handleShowUserInfo = (chat: Chat) => {
    setSelectedUserInfo({
      name: chat.name,
      email: `${chat.name.toLowerCase().replace(' ', '.')}@email.com`,
      phone: '+1 (555) 123-4567',
      rating: 4.8,
      jobsCompleted: 24
    });
    setShowUserModal(true);
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

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'from-secondary to-accent';
      case 'pending':
        return 'from-support to-support/80';
      case 'completed':
        return 'from-primary to-primary/80';
      default:
        return 'from-secondary to-accent';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'active':
        return <Zap size={16} />;
      case 'pending':
        return <Clock size={16} />;
      case 'completed':
        return <CheckCircle size={16} />;
      default:
        return <MessageCircle size={16} />;
    }
  };

  const renderMessage = (msg: Message) => {
    const isMyMessage = msg.sender === 'me';
    
    if (userRole === 'joseador') {
      return (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[65%] rounded-3xl px-5 py-3 backdrop-blur-sm ${ 
              isMyMessage
                ? 'bg-gradient-to-r from-secondary to-accent text-white shadow-lg'
                : 'bg-white/80 text-foreground border border-secondary/20'
            }`}
          >
            <p className="font-paragraph text-sm">{msg.text}</p>
            <p className={`font-paragraph text-xs mt-2 ${ 
              isMyMessage ? 'text-white/70' : 'text-muted-text'
            }`}>
              {msg.time}
            </p>
          </div>
        </motion.div>
      );
    } else {
      return (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[65%] rounded-3xl px-5 py-3 backdrop-blur-sm ${ 
              isMyMessage
                ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg'
                : 'bg-white/80 text-foreground border border-primary/20'
            }`}
          >
            <p className="font-paragraph text-sm">{msg.text}</p>
            <p className={`font-paragraph text-xs mt-2 ${ 
              isMyMessage ? 'text-white/70' : 'text-muted-text'
            }`}>
              {msg.time}
            </p>
          </div>
        </motion.div>
      );
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-[#f0fbf8] to-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-support/10 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[120rem] mx-auto px-6 py-4">
          <Link to={getBackLink()} className="inline-flex items-center gap-2 text-muted-text hover:text-secondary transition-colors font-paragraph font-semibold group">
            <motion.div
              whileHover={{ x: -4 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowLeft size={20} className="group-hover:text-secondary transition-colors" />
            </motion.div>
            <span>Volver</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[120rem] mx-auto px-6 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="h-[calc(100vh-180px)]"
        >
          {/* Title with Icon */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
              <MessageSquare className="text-white" size={24} />
            </div>
            <h1 className="font-heading text-5xl font-bold bg-gradient-to-r from-secondary via-accent to-support bg-clip-text text-transparent">
              Mis Mensajes
            </h1>
          </div>

          <div className="flex gap-6 h-[calc(100vh-280px)]">
            {/* Chat List - 25-30% */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="w-[28%] bg-white/80 backdrop-blur-sm rounded-3xl border border-border/50 shadow-lg overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-border/50 bg-gradient-to-r from-secondary/5 to-accent/5">
                <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
                  <MessageCircle size={20} className="text-secondary" />
                  Conversaciones
                </h2>
              </div>
              <div className="overflow-y-auto flex-1">
                {loading ? (
                  <div className="p-8 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-8 h-8 rounded-full border-2 border-secondary border-t-transparent mx-auto mb-4"
                    />
                    <p className="font-paragraph text-sm text-muted-text">Cargando conversaciones...</p>
                  </div>
                ) : chats.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare size={48} className="text-muted-text/30 mx-auto mb-4" />
                    <p className="font-paragraph text-sm text-muted-text">No tienes conversaciones</p>
                  </div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {chats.map((chat) => (
                      <motion.div
                        key={chat.id}
                        variants={itemVariants}
                        whileHover={{ backgroundColor: selectedChat === chat.id ? undefined : 'rgba(0,0,0,0.02)' }}
                        onClick={() => setSelectedChat(chat.id)}
                        className={`p-4 border-b border-border/30 cursor-pointer transition-all relative group ${ 
                          selectedChat === chat.id 
                            ? 'bg-gradient-to-r from-secondary/10 to-accent/10 border-l-4 border-l-secondary' 
                            : 'hover:bg-white/50'
                        }`}
                      >
                        {/* Status indicator */}
                        <div className="absolute top-3 right-3">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className={`w-3 h-3 rounded-full bg-gradient-to-r ${getStatusColor(chat.status)}`}
                          />
                        </div>

                        <div className="flex items-start gap-3">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={`w-12 h-12 rounded-full bg-gradient-to-br ${getStatusColor(chat.status)} flex items-center justify-center flex-shrink-0 shadow-md`}
                          >
                            <User size={22} className="text-white" />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-heading font-semibold text-foreground text-sm truncate">
                                {chat.name}
                              </h3>
                              <span className="font-paragraph text-xs text-muted-text flex-shrink-0 ml-2">
                                {chat.time}
                              </span>
                            </div>
                            <p className="font-paragraph text-xs text-secondary font-medium mb-1 truncate flex items-center gap-1">
                              {getStatusIcon(chat.status)}
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
                              className="w-6 h-6 rounded-full bg-gradient-to-r from-accent to-support flex items-center justify-center flex-shrink-0 shadow-md"
                            >
                              <span className="font-paragraph text-xs text-white font-bold">
                                {chat.unread}
                              </span>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Chat Window - 70-75% */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 bg-white/80 backdrop-blur-sm rounded-3xl border border-border/50 shadow-lg flex flex-col overflow-hidden"
            >
              {selectedChat && selectedChatData ? (
                <>
                  {/* Chat Header */}
                  <div className="p-6 border-b border-border/50 bg-gradient-to-r from-secondary/5 to-accent/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className={`w-14 h-14 rounded-full bg-gradient-to-br ${getStatusColor(selectedChatData.status)} flex items-center justify-center shadow-md`}
                        >
                          <User size={24} className="text-white" />
                        </motion.div>
                        <div>
                          <h3 className="font-heading font-bold text-foreground text-lg">
                            {selectedChatData.name}
                          </h3>
                          <p className="font-paragraph text-sm text-muted-text flex items-center gap-2">
                            <Briefcase size={14} className="text-secondary" />
                            {selectedChatData.jobTitle}
                          </p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleShowUserInfo(selectedChatData)}
                        className="p-3 rounded-2xl hover:bg-secondary/10 transition-colors text-secondary hover:text-secondary/80"
                        title="Ver información del usuario"
                      >
                        <Info size={22} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Action Buttons Bar - Sticky */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-6 py-4 bg-gradient-to-r from-secondary/5 to-accent/5 border-b border-border/50 flex gap-2 overflow-x-auto"
                  >
                    {userRole === 'joseador' ? (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-secondary to-accent text-white rounded-2xl font-paragraph text-sm font-semibold hover:shadow-lg transition-all whitespace-nowrap"
                        >
                          <Calendar size={16} />
                          Proponer horario
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-secondary/30 rounded-2xl font-paragraph text-sm font-semibold text-foreground hover:bg-secondary/5 transition-all whitespace-nowrap"
                        >
                          <AlertCircle size={16} />
                          Reportar
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-destructive/30 rounded-2xl font-paragraph text-sm font-semibold text-destructive hover:bg-destructive/5 transition-all whitespace-nowrap"
                        >
                          <X size={16} />
                          Rechazar
                        </motion.button>
                      </>
                    ) : (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-primary/30 rounded-2xl font-paragraph text-sm font-semibold text-foreground hover:bg-primary/5 transition-all whitespace-nowrap"
                        >
                          <DollarSign size={16} />
                          Renegociar
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-2xl font-paragraph text-sm font-semibold hover:shadow-lg transition-all whitespace-nowrap"
                        >
                          <CheckCircle size={16} />
                          Completado
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-destructive/30 rounded-2xl font-paragraph text-sm font-semibold text-destructive hover:bg-destructive/5 transition-all whitespace-nowrap"
                        >
                          <X size={16} />
                          Cancelar
                        </motion.button>
                      </>
                    )}
                  </motion.div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white/50 to-white/30">
                    {messages.map((msg) => renderMessage(msg))}
                  </div>

                  {/* Pending Request Banner - Sticky */}
                  <AnimatePresence>
                    {pendingRequest && (
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        className="px-6 py-4 bg-gradient-to-r from-secondary/10 to-accent/10 border-t-2 border-secondary/30 border-b-2 border-secondary/30"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 flex items-center gap-3">
                            <motion.div
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-8 h-8 rounded-full bg-gradient-to-r from-secondary to-accent flex items-center justify-center flex-shrink-0"
                            >
                              <Clock size={16} className="text-white" />
                            </motion.div>
                            <div>
                              <p className="font-heading text-sm font-bold text-foreground">
                                {pendingRequest.title}
                              </p>
                              <p className="font-paragraph text-xs text-muted-text">
                                Expira en: <span className="font-bold text-secondary">{formatCountdown(countdown)}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-5 py-2 bg-gradient-to-r from-secondary to-accent text-white rounded-xl font-paragraph text-xs font-bold hover:shadow-lg transition-all"
                            >
                              Aceptar
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setPendingRequest(null)}
                              className="px-5 py-2 bg-white border-2 border-border text-foreground rounded-xl font-paragraph text-xs font-bold hover:bg-background transition-all"
                            >
                              Rechazar
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-6 border-t border-border/50 bg-white/50 backdrop-blur-sm">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 px-5 py-3 border-2 border-border/50 rounded-2xl font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent bg-white/80 transition-all"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-secondary to-accent text-white rounded-2xl font-paragraph font-bold hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <Send size={18} />
                      </motion.button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center mx-auto mb-6"
                    >
                      <MessageSquare size={40} className="text-secondary/50" />
                    </motion.div>
                    <p className="font-paragraph text-lg text-muted-text font-medium">
                      Selecciona una conversación para empezar
                    </p>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* User Info Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border border-border/50">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              Información del Usuario
            </DialogTitle>
          </DialogHeader>
          {selectedUserInfo && (
            <div className="space-y-6">
              {/* User Avatar and Name */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center mb-4 shadow-lg"
                >
                  <User size={48} className="text-white" />
                </motion.div>
                <h2 className="font-heading text-2xl font-bold text-foreground">
                  {selectedUserInfo.name}
                </h2>
              </motion.div>

              {/* User Details */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {/* Email */}
                <motion.div variants={itemVariants} className="flex items-start gap-3 p-4 bg-gradient-to-r from-secondary/10 to-accent/10 rounded-2xl border border-secondary/20">
                  <div className="flex-shrink-0 mt-1">
                    <Mail size={20} className="text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-paragraph text-xs text-muted-text font-semibold mb-1">Correo Electrónico</p>
                    <p className="font-paragraph text-sm text-foreground break-all font-medium">
                      {selectedUserInfo.email}
                    </p>
                  </div>
                </motion.div>

                {/* Phone */}
                {selectedUserInfo.phone && (
                  <motion.div variants={itemVariants} className="flex items-start gap-3 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border border-primary/20">
                    <div className="flex-shrink-0 mt-1">
                      <Phone size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-paragraph text-xs text-muted-text font-semibold mb-1">Teléfono</p>
                      <p className="font-paragraph text-sm text-foreground font-medium">
                        {selectedUserInfo.phone}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Rating */}
                {selectedUserInfo.rating && (
                  <motion.div variants={itemVariants} className="flex items-start gap-3 p-4 bg-gradient-to-r from-accent/10 to-support/10 rounded-2xl border border-accent/20">
                    <div className="flex-shrink-0 mt-1">
                      <Star size={20} className="text-accent fill-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-paragraph text-xs text-muted-text font-semibold mb-1">Calificación</p>
                      <p className="font-paragraph text-sm text-foreground font-bold">
                        {selectedUserInfo.rating} ⭐
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Jobs Completed */}
                {selectedUserInfo.jobsCompleted !== undefined && (
                  <motion.div variants={itemVariants} className="flex items-start gap-3 p-4 bg-gradient-to-r from-support/10 to-secondary/10 rounded-2xl border border-support/20">
                    <div className="flex-shrink-0 mt-1">
                      <Briefcase size={20} className="text-support" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-paragraph text-xs text-muted-text font-semibold mb-1">Trabajos Completados</p>
                      <p className="font-paragraph text-sm text-foreground font-bold">
                        {selectedUserInfo.jobsCompleted}
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowUserModal(false)}
                className="w-full px-4 py-3 bg-gradient-to-r from-secondary to-accent text-white rounded-2xl font-paragraph font-bold hover:shadow-lg transition-all"
              >
                Cerrar
              </motion.button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
