import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Brain, History, MessageCircle, Plus, Send, Trash2, X } from 'lucide-react';
import {
  deleteConversation,
  forgetMemory,
  getConversation,
  getMemory,
  listConversations,
  requestChatReply,
} from '../services/backendApi';

const STARTERS = ['How did I do this month?', 'Where am I overspending?', "I'm saving for a ₹60,000 laptop by March"];

const relativeDay = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
function formatWhen(value) {
  const date = new Date(value);
  const days = Math.round((date.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86_400_000);
  if (days > -7) return relativeDay.format(days, 'day');
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// Models answer in light markdown. Render **bold** as React elements (never raw HTML)
// and leave everything else as text, which whitespace-pre-wrap already lays out.
function renderInline(text) {
  return text.split(/(\*\*[^*\n]+\*\*)/g).map((part, index) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4
      ? <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>
      : part.replace(/^#{1,6}\s+/gm, '')
  );
}

function IconButton({ label, onClick, active = false, children }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`rounded-md p-1.5 transition-colors ${active ? 'bg-raised text-ink' : 'text-ink-muted hover:bg-raised hover:text-ink'}`}
    >
      {children}
    </button>
  );
}

const Chatbot = ({ transactionCount = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [panel, setPanel] = useState('chat'); // 'chat' | 'history' | 'memory'
  const [conversation, setConversation] = useState(null); // { id, title }
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState(null);
  const [facts, setFacts] = useState(null);
  const [panelError, setPanelError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && panel === 'chat') inputRef.current?.focus();
  }, [isOpen, panel]);

  useEffect(() => {
    if (!isOpen || panel === 'chat') return;
    setPanelError('');
    const load = panel === 'history'
      ? listConversations().then((data) => setConversations(data.conversations))
      : getMemory().then((data) => setFacts(data.facts));
    load.catch((error) => setPanelError(error.message));
  }, [isOpen, panel]);

  const startNewChat = () => {
    setConversation(null);
    setMessages([]);
    setPanel('chat');
  };

  const openConversation = async (id) => {
    setPanel('chat');
    setIsLoading(true);
    setMessages([]);
    try {
      const data = await getConversation(id);
      setConversation({ id: data.conversation.id, title: data.conversation.title });
      setMessages(data.messages.map(({ role, content }) => ({ role, content })));
    } catch (error) {
      setMessages([{ role: 'assistant', content: error.message, error: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const removeConversation = async (id) => {
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((item) => item.id !== id));
      if (conversation?.id === id) startNewChat();
    } catch (error) {
      setPanelError(error.message);
    }
  };

  const removeFact = async (factId) => {
    try {
      const data = await forgetMemory(factId);
      setFacts(data.facts);
    } catch (error) {
      setPanelError(error.message);
    }
  };

  const sendMessage = async (text) => {
    const message = text.trim();
    if (!message || isLoading) return;

    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const data = await requestChatReply(message, conversation?.id);
      setConversation(data.conversation);
      setConversations(null); // list is stale now; refetched next time it opens
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply, remembered: data.remembered }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: error.message || 'Something went wrong. Please try again.', error: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const headerTitle =
    panel === 'history' ? 'Past conversations' : panel === 'memory' ? 'What I remember' : conversation?.title || 'New conversation';

  return (
    <>
      {isOpen && (
        <div
          role="dialog"
          aria-label="FinWise assistant"
          className="fixed bottom-24 right-4 z-50 flex h-[34rem] max-h-[75vh] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-2xl shadow-black/40 sm:right-6 sm:w-[26rem]"
        >
          <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
            {panel !== 'chat' ? (
              <IconButton label="Back to chat" onClick={() => setPanel('chat')}>
                <ArrowLeft size={18} />
              </IconButton>
            ) : null}
            <div className="min-w-0 flex-1 px-1">
              <h3 className="truncate text-sm font-semibold text-ink">{headerTitle}</h3>
              {panel === 'chat' ? (
                <p className="text-xs text-ink-subtle">Answers from your {transactionCount} logged transactions</p>
              ) : null}
            </div>
            <IconButton label="New conversation" onClick={startNewChat}>
              <Plus size={18} />
            </IconButton>
            <IconButton label="Past conversations" active={panel === 'history'} onClick={() => setPanel('history')}>
              <History size={18} />
            </IconButton>
            <IconButton label="What I remember" active={panel === 'memory'} onClick={() => setPanel('memory')}>
              <Brain size={18} />
            </IconButton>
            <IconButton label="Close assistant" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </IconButton>
          </div>

          {panel === 'history' && (
            <div className="flex-1 overflow-y-auto bg-canvas p-3">
              {panelError ? <p className="mb-2 text-sm text-loss">{panelError}</p> : null}
              {conversations === null && !panelError ? <p className="text-sm text-ink-subtle">Loading…</p> : null}
              {conversations?.length === 0 ? <p className="text-sm text-ink-subtle">No saved conversations yet.</p> : null}
              <ul className="space-y-1.5">
                {conversations?.map((item) => (
                  <li key={item.id} className={`group flex items-start gap-2 rounded-lg border p-3 ${conversation?.id === item.id ? 'border-accent/40 bg-accent/5' : 'border-line bg-surface hover:border-line-strong'}`}>
                    <button onClick={() => openConversation(item.id)} className="min-w-0 flex-1 text-left">
                      <p className="truncate text-sm font-medium text-ink">{item.title}</p>
                      <p className="mt-0.5 truncate text-xs text-ink-subtle">{item.preview}</p>
                      <p className="mt-1 text-xs text-ink-subtle">{formatWhen(item.updatedAt)} · {item.messageCount} messages</p>
                    </button>
                    <button
                      onClick={() => removeConversation(item.id)}
                      className="rounded-md p-1 text-ink-subtle opacity-60 hover:bg-raised hover:text-loss group-hover:opacity-100"
                      aria-label={`Delete conversation ${item.title}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {panel === 'memory' && (
            <div className="flex-1 overflow-y-auto bg-canvas p-3">
              <p className="mb-3 text-xs leading-relaxed text-ink-subtle">
                Things you have told the assistant that it keeps across conversations. It never stores account numbers or passwords.
              </p>
              {panelError ? <p className="mb-2 text-sm text-loss">{panelError}</p> : null}
              {facts === null && !panelError ? <p className="text-sm text-ink-subtle">Loading…</p> : null}
              {facts?.length === 0 ? (
                <p className="text-sm text-ink-subtle">Nothing yet. Mention a goal or an upcoming expense and it will show up here.</p>
              ) : null}
              <ul className="space-y-1.5">
                {facts?.map((fact) => (
                  <li key={fact.id} className="flex items-start gap-2 rounded-lg border border-line bg-surface p-3">
                    <p className="flex-1 text-sm text-ink">{fact.text}</p>
                    <button
                      onClick={() => removeFact(fact.id)}
                      className="rounded-md p-1 text-ink-subtle hover:bg-raised hover:text-loss"
                      aria-label={`Forget: ${fact.text}`}
                    >
                      <X size={15} />
                    </button>
                  </li>
                ))}
              </ul>
              {facts?.length ? (
                <button
                  onClick={() => removeFact(null)}
                  className="mt-4 text-sm font-medium text-loss hover:underline"
                >
                  Forget everything
                </button>
              ) : null}
            </div>
          )}

          {panel === 'chat' && (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto bg-canvas p-4">
                {messages.length === 0 && !isLoading ? (
                  <div className="space-y-3">
                    <p className="text-sm text-ink-muted">Ask about your own spending, or tell me about a goal. A few ideas:</p>
                    {STARTERS.map((starter) => (
                      <button
                        key={starter}
                        onClick={() => sendMessage(starter)}
                        className="block w-full rounded-lg border border-line bg-surface px-3 py-2 text-left text-sm text-ink transition-colors hover:border-line-strong"
                      >
                        {starter}
                      </button>
                    ))}
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div key={index} className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <p
                        className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3.5 py-2 text-sm leading-relaxed ${
                          message.role === 'user'
                            ? 'bg-accent text-accent-ink'
                            : message.error
                              ? 'border border-loss/30 bg-loss/10 text-loss'
                              : 'bg-raised text-ink'
                        }`}
                      >
                        {message.role === 'assistant' && !message.error ? renderInline(message.content) : message.content}
                      </p>
                      {message.remembered?.length ? (
                        <button
                          onClick={() => setPanel('memory')}
                          className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-subtle hover:text-ink-muted"
                        >
                          <Brain size={12} className="text-accent" />
                          Remembered: {message.remembered.map((fact) => fact.text).join(' · ')}
                        </button>
                      ) : null}
                    </div>
                  ))
                )}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-1 rounded-xl bg-raised px-3.5 py-3" aria-label="Assistant is typing">
                      {[0, 0.15, 0.3].map((delay) => (
                        <span key={delay} className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-subtle" style={{ animationDelay: `${delay}s` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form
                className="flex items-center gap-2 border-t border-line bg-surface p-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  sendMessage(inputValue);
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  placeholder="Ask about your money…"
                  maxLength={1000}
                  disabled={isLoading}
                  className="flex-1 rounded-lg border border-line bg-raised px-3.5 py-2 text-sm text-ink placeholder-ink-subtle focus:border-accent focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="rounded-lg bg-accent p-2 text-accent-ink transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send"
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      <button
        onClick={() => setIsOpen((open) => !open)}
        className={`fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-xl shadow-black/40 transition-colors sm:right-6 ${
          isOpen ? 'border border-line bg-raised text-ink hover:bg-line' : 'bg-accent text-accent-ink hover:bg-accent-hover'
        }`}
        aria-label={isOpen ? 'Close assistant' : 'Open assistant'}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </>
  );
};

export default Chatbot;
