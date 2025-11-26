import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Send, User } from 'lucide-react';

export default function InboxPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const chats = [
    {
      id: '1',
      name: 'Juan Pérez',
      jobTitle: 'Reparación de tubería',
      lastMessage: 'Perfecto, nos vemos mañana',
      time: '10:30 AM',
      unread: 2
    },
    {
      id: '2',
      name: 'María González',
      jobTitle: 'Instalación eléctrica',
      lastMessage: '¿A qué hora puedes venir?',
      time: 'Ayer',
      unread: 0
    }
  ];

  const messages = selectedChat ? [
    { id: '1', sender: 'other', text: 'Hola, estoy interesado en el trabajo', time: '9:00 AM' },
    { id: '2', sender: 'me', text: 'Perfecto, ¿cuándo puedes empezar?', time: '9:15 AM' },
    { id: '3', sender: 'other', text: 'Puedo empezar mañana por la mañana', time: '9:30 AM' },
    { id: '4', sender: 'me', text: 'Perfecto, nos vemos mañana', time: '10:30 AM' }
  ] : [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-[100rem] mx-auto px-6 py-4">
          <Link to="/client/dashboard" className="inline-flex items-center gap-2 text-muted-text hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
            <span className="font-paragraph">Volver</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[100rem] mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-heading text-4xl font-bold text-foreground mb-8">
            Mensajes
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
            {/* Chat List */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-border shadow-lg overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-heading text-xl font-semibold text-foreground">
                  Conversaciones
                </h2>
              </div>
              <div className="overflow-y-auto h-full">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    className={`p-4 border-b border-border cursor-pointer transition-colors ${
                      selectedChat === chat.id ? 'bg-primary/5' : 'hover:bg-background'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                        <User size={24} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-heading font-semibold text-foreground truncate">
                            {chat.name}
                          </h3>
                          <span className="font-paragraph text-xs text-muted-text flex-shrink-0">
                            {chat.time}
                          </span>
                        </div>
                        <p className="font-paragraph text-sm text-primary mb-1">
                          {chat.jobTitle}
                        </p>
                        <p className="font-paragraph text-sm text-muted-text truncate">
                          {chat.lastMessage}
                        </p>
                      </div>
                      {chat.unread > 0 && (
                        <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                          <span className="font-paragraph text-xs text-white font-bold">
                            {chat.unread}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Window */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-border shadow-lg flex flex-col overflow-hidden">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <User size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold text-foreground">
                          {chats.find(c => c.id === selectedChat)?.name}
                        </h3>
                        <p className="font-paragraph text-sm text-muted-text">
                          {chats.find(c => c.id === selectedChat)?.jobTitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                            msg.sender === 'me'
                              ? 'bg-gradient-to-r from-primary to-secondary text-white'
                              : 'bg-background text-foreground'
                          }`}
                        >
                          <p className="font-paragraph">{msg.text}</p>
                          <p className={`font-paragraph text-xs mt-1 ${
                            msg.sender === 'me' ? 'text-white/70' : 'text-muted-text'
                          }`}>
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 px-4 py-3 border border-border rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-paragraph font-semibold hover:shadow-lg transition-shadow"
                      >
                        <Send size={20} />
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
