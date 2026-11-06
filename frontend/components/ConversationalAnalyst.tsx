import React, { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Sparkles, BarChart3, ChevronDown, ChevronUp, Copy, Check, AlertCircle, Database, Download, Send, RefreshCw, User, Bot } from 'lucide-react';

interface VizConfig {
  type: 'bar' | 'line' | 'kpi' | 'table';
  xAxisKey?: string;
  yAxisKeys?: string[];
  title?: string;
  kpiValue?: string | number;
  kpiLabel?: string;
}

interface QueryResponsePayload {
  queryId: string;
  userQuestion: string;
  generatedSql: string;
  summary: string;
  columns: Array<{ name: string; type: string }>;
  rows: Array<Record<string, any>>;
  visualization: VizConfig;
  executionTimeMs: number;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content?: string;
  data?: QueryResponsePayload;
  error?: string;
  timestamp: string;
}

export const ConversationalAnalyst: React.FC = () => {
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedSql, setExpandedSql] = useState<Record<string, boolean>>({});
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const sampleQuestions = [
    "Show total approved applications per branch",
    "List top customers in the Wealth segment",
    "Count transactions by channel and category"
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (questionText?: string) => {
    const textToSubmit = questionText || inputQuestion;
    if (!textToSubmit.trim() || loading) return;

    const userMsgId = crypto.randomUUID();
    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      content: textToSubmit,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!questionText) setInputQuestion('');
    setLoading(true);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: textToSubmit })
      });

      const resultPayload = await response.json();

      if (!response.ok) {
        throw new Error(resultPayload.details || resultPayload.error || 'Failed to process question.');
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'assistant',
        data: resultPayload,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'assistant',
        error: err.message || 'An unexpected server error occurred.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSql = (id: string) => {
    setExpandedSql((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatColumnHeader = (colName: string) => {
    return colName.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="flex flex-col h-screen max-w-6xl mx-auto p-4 md:p-6 text-slate-100">
      {/* Header */}
      <header className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Banking Conversational Analyst</h1>
            {/* <p className="text-slate-400 text-xs">Natural Language Querying over Customer, Application & Transaction Datasets</p> */}
          </div>
        </div>
        <button
          onClick={() => setMessages([])}
          className="flex items-center gap-1.5 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Clear Chat
        </button>
      </header>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 glass-panel rounded-3xl p-8 border border-slate-800/60">
            <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-400 border border-emerald-500/20">
              <Bot className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-1">
              <h2 className="text-lg font-bold text-white">Ask your banking data anything</h2>
              {/* <p className="text-slate-400 text-xs leading-relaxed">
                Queries are converted to SQL, validated through security guardrails, and executed dynamically.
              </p> */}
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {sampleQuestions.map((q, idx) => (
                <><button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 px-3.5 py-2 rounded-full transition-all"
                >
                  {q}
                </button>,&nbsp;</>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-3xl space-y-3 ${msg.sender === 'user' ? 'w-auto' : 'w-full'}`}>
              {/* User Question Bubble */}
              {msg.sender === 'user' && (
                <div className="bg-emerald-600 text-slate-950 font-medium px-5 py-3 rounded-2xl rounded-tr-none text-sm shadow-md">
                  {msg.content}
                </div>
              )}

              {/* Error Response Card */}
              {msg.error && (
                <div className="bg-rose-950/40 border border-rose-800/60 text-rose-200 p-4 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Query Failed</p>
                    <p className="text-xs text-rose-300/80 mt-0.5">{msg.error}</p>
                  </div>
                </div>
              )}

              {/* Assistant Result Card */}
              {msg.data && (
                <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4 animate-fade-in">
                  {/* Plain English Summary */}
                  <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-800/80">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Executive Insight</span>
                      <h3 className="text-base font-semibold text-white mt-0.5">{msg.data.summary}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => copyToClipboard(msg.data!.summary, `${msg.id}-summary`)}
                        className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-slate-400 hover:text-slate-200 text-xs transition-all flex items-center gap-1"
                        title="Copy Summary"
                      >
                        {copiedId === `${msg.id}-summary` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">Text</span>
                      </button>
                      <br/>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(msg.data!.rows, null, 2), `${msg.id}-json`)}
                        className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-slate-400 hover:text-slate-200 text-xs transition-all flex items-center gap-1"
                        title="Copy Raw Data JSON"
                      >
                        {copiedId === `${msg.id}-json` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">JSON</span>
                      </button>
                    </div>
                  </div>

                  {/* Visualization Card */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-emerald-400" />
                      {msg.data.visualization.title || 'Visual Summary'}
                    </h4>

                    {/* KPI Display */}
                    {msg.data.visualization.type === 'kpi' && (
                      <div className="flex flex-col items-center justify-center py-8 bg-slate-900/50 rounded-xl border border-slate-800">
                        <span className="text-5xl font-black text-emerald-400">
                          {msg.data.visualization.kpiValue ?? msg.data.rows[0]?.[Object.keys(msg.data.rows[0])[0]]}
                        </span>
                        <span className="text-slate-400 text-xs font-medium mt-2">
                          {msg.data.visualization.kpiLabel || 'Result Metric'}
                        </span>
                      </div>
                    )}

                    {/* Bar Chart */}
                    {msg.data.visualization.type === 'bar' && msg.data.visualization.xAxisKey && (
                      <div className="pt-2">
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart data={msg.data.rows}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey={msg.data.visualization.xAxisKey} stroke="#94a3b8" tickLine={false} />
                            <YAxis stroke="#94a3b8" tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                            {msg.data.visualization.yAxisKeys?.map((key) => (
                              <Bar key={key} dataKey={key} fill="#10b981" radius={[4, 4, 0, 0]} />
                            ))}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Line Chart */}
                    {msg.data.visualization.type === 'line' && msg.data.visualization.xAxisKey && (
                      <div className="pt-2">
                        <ResponsiveContainer width="100%" height={260}>
                          <LineChart data={msg.data.rows}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey={msg.data.visualization.xAxisKey} stroke="#94a3b8" tickLine={false} />
                            <YAxis stroke="#94a3b8" tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                            {msg.data.visualization.yAxisKeys?.map((key) => (
                              <Line key={key} type="monotone" dataKey={key} stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Table View */}
                    {msg.data.visualization.type === 'table' && (
                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-left text-xs text-slate-300">
                          <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                            <tr>
                              {msg.data.columns.map((col) => (
                                <th key={col.name} className="px-4 py-3">{formatColumnHeader(col.name)}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                            {msg.data.rows.map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                                {msg.data!.columns.map((col) => (
                                  <td key={col.name} className="px-4 py-3 text-slate-200">{String(row[col.name] ?? '-')}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Collapsible Technical Audit Section */}
                  {/* <div className="border border-slate-800/80 rounded-xl overflow-hidden mt-3">
                    <button
                      onClick={() => toggleSql(msg.id)}
                      className="w-full flex items-center justify-between p-3 bg-slate-900/60 hover:bg-slate-900 transition-colors text-[11px] font-medium text-slate-400"
                    >
                      <span className="flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-emerald-400" />
                        SQL Audit & Execution Details
                      </span>
                      {expandedSql[msg.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {expandedSql[msg.id] && (
                      <div className="p-3 bg-slate-950/90 border-t border-slate-800 space-y-2 font-mono text-xs">
                        <code className="text-emerald-300 block bg-slate-900 p-2.5 rounded-lg border border-slate-800 overflow-x-auto">
                          {msg.data.generatedSql}
                        </code>
                        <div className="text-[10px] text-slate-500">
                          Execution time: {msg.data.executionTimeMs}ms • Query ID: {msg.data.queryId}
                        </div>
                      </div>
                    )}
                  </div> */}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="glass-panel px-5 py-4 rounded-2xl flex items-center gap-2 text-xs text-slate-400">
              <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing database context & executing query...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Fixed Chat Input Form */}
      <div className="flex-shrink-0 pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Ask a question about banking data..."
            className="flex-1 glass-input rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !inputQuestion.trim()}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-semibold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-950/30 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};