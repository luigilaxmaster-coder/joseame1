import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useMember } from '@/integrations';
import { useRoleStore } from '@/store/roleStore';
import { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Send, Trash2, MoreHorizontal, Search, Plus } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  getMyConversations, 
  startConversation, 
  getConversationMessages, 
  sendMessageToConversation,
  removeMessage,
  fetchConversation,
  type Conversation,
  type Message,
  type PaginatedResult
} from '@/lib/multi-tenant-messaging-service';
import { fetchPublicProfile, type UserProfile } from '@/lib/multi-tenant-profiles-service';

type ViewMode = 'list' | 'chat';

interface ConversationWithProfile extends Conversation {
  otherUserProfile?: Partial<UserProfile>;
}

function InboxPage() {
  const { member } = useMember();
  const { userRole } = useRoleStore();
  const navigate = useNavigate();
  const { conversationId: urlConversationId } = useParams();

  // State Management
  const [viewMode, setViewMode] = useState<ViewMode>(urlConversationId ? 'chat' : 'list');
  const [conversations, setConversations] = useState<ConversationWithProfile[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const getBackButtonPath = () => {
    if (userRole === 'client') return '/client/dashboard';
    if (userRole === 'joseador') return '/joseador/dashboard';
    return '/';
  };

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
    if (urlConversationId) {
      loadConversationChat(urlConversationId);
    }
  }, [member?.loginEmail]);

  const loadConversations = async () => {
    if (!member?.loginEmail) return;
    
    try {
      setLoading(true);
      setError('');
      const result = await getMyConversations(50);
      
      // Enrich conversations with other user's profile
      const enrichedConversations = await Promise.all(
        result.items.map(async (conv) => {
          const participants = conv.participants.split(',').map(p => p.trim());
          const otherMemberId = participants.find(p => p !== member.loginEmail);
          
          if (otherMemberId) {
            try {
              const profile = await fetchPublicProfile(otherMemberId);
              return { ...conv, otherUserProfile: profile };
            } catch (err) {
              console.error('Failed to fetch profile:', err);
              return conv;
            }
          }
          return conv;
        })
      );
      
      setConversations(enrichedConversations);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError('Error al cargar conversaciones');
    } finally {
      setLoading(false);
    }
  };

  const loadConversationChat = async (convId: string) => {
    if (!member?.loginEmail) return;
    
    try {
      setMessagesLoading(true);
      setError('');
      
      // Get conversation details
      const conversation = await fetchConversation(convId);
      
      // Enrich with profile
      const participants = conversation.participants.split(',').map(p => p.trim());
      const otherMemberId = participants.find(p => p !== member.loginEmail);
      
      let enrichedConv = conversation as ConversationWithProfile;
      if (otherMemberId) {
        try {
          const profile = await fetchPublicProfile(otherMemberId);
          enrichedConv.otherUserProfile = profile;
        } catch (err) {
          console.error('Failed to fetch profile:', err);
        }
      }
      
      setSelectedConversation(enrichedConv);
      setViewMode('chat');
      
      // Get messages
      const messagesResult = await getConversationMessages(convId, 50);
      setMessages(messagesResult.items);
    } catch (err) {
      console.error('Failed to load conversation:', err);
      setError('Error al cargar conversación');
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleStartConversation = async (otherMemberId: string) => {
    try {
      setError('');
      const conversation = await startConversation(otherMemberId);
      await loadConversationChat(conversation._id);
    } catch (err) {
      console.error('Failed to start conversation:', err);
      setError('Error al iniciar conversación');
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;
    
    try {
      setError('');
      const newMessage = await sendMessageToConversation(
        selectedConversation._id,
        messageInput.trim()
      );
      
      setMessages([...messages, newMessage]);
      setMessageInput('');
      
      // Update conversation's last message
      await loadConversations();
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Error al enviar mensaje');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      setError('');
      await removeMessage(messageId);
      setMessages(messages.filter(m => m._id !== messageId));
    } catch (err) {
      console.error('Failed to delete message:', err);
      setError('Error al eliminar mensaje');
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const otherUserName = conv.otherUserProfile?.firstName || 'Usuario';
    return otherUserName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-[100rem] mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <button
            onClick={() => {
              if (viewMode === 'chat') {
                setViewMode('list');
                setSelectedConversation(null);
              } else {
                navigate(getBackButtonPath());
              }
            }}
            className="inline-flex items-center gap-2 transition-colors font-paragraph font-semibold text-sm md:text-base h-10 px-3 rounded-lg text-muted-text hover:text-primary hover:bg-background"
          >
            <ArrowLeft size={18} className="md:w-5 md:h-5" />
            <span className="hidden sm:inline">Volver</span>
          </button>

          <h1 className="font-heading font-bold text-lg md:text-xl text-foreground">
            {viewMode === 'chat' ? selectedConversation?.otherUserProfile?.firstName || 'Chat' : 'Mensajes'}
          </h1>

          <div className="w-10" />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[100rem] mx-auto h-[calc(100vh-80px)] flex">
        <AnimatePresence mode="wait">
          {/* Conversations List View */}
          {viewMode === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full md:w-96 border-r border-border flex flex-col"
            >
              {/* Search Bar */}
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-text" />
                  <input
                    type="text"
                    placeholder="Buscar conversaciones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <LoadingSpinner />
                  </div>
                ) : filteredConversations.length > 0 ? (
                  <div className="divide-y divide-border">
                    {filteredConversations.map((conv, index) => (
                      <motion.button
                        key={conv._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => loadConversationChat(conv._id)}
                        className="w-full p-4 hover:bg-background transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                            {conv.otherUserProfile?.profilePhoto ? (
                              <Image
                                src={conv.otherUserProfile.profilePhoto}
                                alt={conv.otherUserProfile.firstName || 'Usuario'}
                                className="w-full h-full rounded-full object-cover"
                                width={48}
                              />
                            ) : (
                              <MessageCircle size={20} className="text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-heading font-bold text-foreground text-sm">
                              {conv.otherUserProfile?.firstName || 'Usuario'}
                            </p>
                            <p className="font-paragraph text-xs text-muted-text truncate">
                              {conv.lastMessageText || 'Sin mensajes'}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
                    <MessageCircle size={40} className="text-muted-text" />
                    <p className="font-paragraph text-center text-muted-text">
                      {searchQuery ? 'No se encontraron conversaciones' : 'Sin conversaciones aún'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Chat View */}
          {viewMode === 'chat' && selectedConversation && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full flex flex-col"
            >
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <LoadingSpinner />
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg, index) => (
                    <motion.div
                      key={msg._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex ${msg.senderId === member?.loginEmail ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                          msg.senderId === member?.loginEmail
                            ? 'bg-primary text-white'
                            : 'bg-background border border-border text-foreground'
                        }`}
                      >
                        <p className="font-paragraph text-sm">{msg.text}</p>
                        <p className={`font-paragraph text-xs mt-1 ${
                          msg.senderId === member?.loginEmail ? 'text-white/70' : 'text-muted-text'
                        }`}>
                          {new Date(msg.createdAt).toLocaleTimeString('es-DO', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                      {msg.senderId === member?.loginEmail && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="ml-2 p-1 hover:bg-background rounded transition-colors"
                        >
                          <Trash2 size={14} className="text-muted-text" />
                        </motion.button>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <MessageCircle size={40} className="text-muted-text" />
                    <p className="font-paragraph text-center text-muted-text">
                      Inicia la conversación
                    </p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="border-t border-border p-4 md:p-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <p className="font-paragraph text-sm text-destructive">{error}</p>
                  </motion.div>
                )}
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 px-4 py-2 border border-border rounded-lg font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="px-4 py-2 bg-primary text-white rounded-lg font-paragraph font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send size={16} />
                    <span className="hidden sm:inline">Enviar</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default InboxPage;
