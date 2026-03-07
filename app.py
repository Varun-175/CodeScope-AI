"""
app.py — CodeScope AI  Streamlit frontend
Premium dark-theme UI with live streaming answers and chat history.
"""

import streamlit as st
from rag_engine import build_rag_chain, stream_answer, clean_markdown, LLM_PROVIDERS, GROQ_MODELS, HF_MODELS

# ─────────────────────────────────────────────────────────────────────────────
# Page config  (MUST be first Streamlit call)
# ─────────────────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="CodeScope AI",
    page_icon="🔭",
    layout="wide",
    initial_sidebar_state="expanded",
    menu_items={"About": "CodeScope AI — RAG-powered codebase intelligence using Gemini & LangChain."},
)

# ─────────────────────────────────────────────────────────────────────────────
# Global CSS
# ─────────────────────────────────────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

/* ── Base ── */
html, body, [class*="css"] { font-family: 'Inter', sans-serif; }

/* ── Top gradient bar ── */
section[data-testid="stSidebar"] ~ div [data-testid="stAppViewContainer"]::before,
[data-testid="stHeader"] {
    background: transparent;
}
[data-testid="stHeader"]::after {
    content: "";
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899, #f59e0b);
    z-index: 9999;
}

/* ── Hero ── */
.cs-hero {
    padding: 2rem 0 1rem 0;
    text-align: center;
}
.cs-logo {
    font-size: 3.2rem;
    font-weight: 800;
    background: linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.1;
    letter-spacing: -0.03em;
}
.cs-tagline {
    color: #64748b;
    font-size: 1rem;
    margin-top: 0.3rem;
    letter-spacing: 0.04em;
}

/* ── Status dot ── */
.status-dot {
    display: inline-block;
    width: 8px; height: 8px;
    border-radius: 50%;
    margin-right: 6px;
    vertical-align: middle;
}
.dot-green  { background: #22c55e; box-shadow: 0 0 6px #22c55e; }
.dot-grey   { background: #475569; }

/* ── Stat pills ── */
.cs-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 0.8rem 0 1.2rem 0;
    justify-content: center;
}
.cs-pill {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 999px;
    padding: 0.28rem 0.85rem;
    font-size: 0.78rem;
    color: #94a3b8;
    font-weight: 500;
}
.cs-pill span { color: #a5b4fc; font-weight: 600; }

/* ── Chat bubbles ── */
.msg-wrap { display: flex; flex-direction: column; gap: 0.1rem; margin-bottom: 1.4rem; }

.msg-user {
    align-self: flex-end;
    max-width: 72%;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: #fff;
    padding: 0.7rem 1.1rem;
    border-radius: 18px 18px 4px 18px;
    font-size: 0.93rem;
    line-height: 1.5;
    box-shadow: 0 2px 12px rgba(99,102,241,0.3);
}
.msg-label-user {
    align-self: flex-end;
    font-size: 0.7rem;
    color: #64748b;
    margin-bottom: 3px;
    padding-right: 4px;
}
.msg-label-ai {
    font-size: 0.7rem;
    color: #64748b;
    margin-bottom: 3px;
    padding-left: 4px;
}
/* Streamlit's chat elements have their own styling, so we target elements within them */
.st-chat-message-content {
    max-width: 88%;
    border: 1px solid #1e293b;
    border-radius: 4px 18px 18px 18px;
    padding: 1rem 1.2rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    white-space: pre-wrap;
}
.st-chat-message-content p {
    color: #f8fafc;
    line-height: 1.6;
    font-size: 0.95rem;
}
.st-chat-message-content code {
    color: #fca5a5;
    background: #1e293b;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'JetBrains Mono', monospace;
}
.st-chat-message-content pre {
    background: #0f172a !important;
    border: 1px solid #334155 !important;
    border-radius: 8px !important;
    padding: 1rem !important;
    margin: 1rem 0 !important;
}

/* ── Empty state ── */
.cs-empty {
    text-align: center;
    padding: 3rem 1rem;
    color: #475569;
}
.cs-empty-icon { font-size: 3.5rem; margin-bottom: 0.8rem; }
.cs-empty h3 { color: #64748b; font-weight: 600; font-size: 1.1rem; }
.cs-empty p  { font-size: 0.88rem; line-height: 1.6; }

/* ── Sidebar ── */
[data-testid="stSidebar"] { background: #080d14 !important; }
[data-testid="stSidebar"] hr { border-color: #1e293b; }

/* ── Section headers ── */
.cs-section {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: #475569;
    text-transform: uppercase;
    margin: 1.2rem 0 0.5rem 0;
    border-bottom: 1px solid #1e293b;
    padding-bottom: 0.3rem;
}

/* ── Language badge ── */
.lang-badge {
    display: inline-block;
    border-radius: 4px;
    padding: 2px 7px;
    font-size: 0.72rem;
    font-weight: 600;
    margin: 2px;
}
</style>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────────────────────
# Session state defaults
# ─────────────────────────────────────────────────────────────────────────────
defaults = {
    "rag_chain": None,
    "indexed_url": None,
    "repo_name": "",
    "doc_count": 0,
    "lang_stats": {},
    "messages": [],        # list of {"role": "user"|"ai", "content": str}
}
for k, v in defaults.items():
    if k not in st.session_state:
        st.session_state[k] = v

# ─────────────────────────────────────────────────────────────────────────────
# Sidebar
# ─────────────────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("## 🔭 CodeScope AI")
    st.caption("Codebase intelligence via RAG + LLM")
    st.divider()

    # ── LLM Provider ─────────────────────────────────────────────────────────
    st.markdown('<p class="cs-section">🤖 LLM Provider</p>', unsafe_allow_html=True)
    provider = st.selectbox(
        "Provider",
        options=list(LLM_PROVIDERS.keys()),
        format_func=lambda k: LLM_PROVIDERS[k],
        index=0,                          # Groq is default (free)
        label_visibility="collapsed",
    )

    # Dynamic model selector
    if provider == "groq":
        model = st.selectbox("Model", GROQ_MODELS, label_visibility="collapsed")
        key_label = "Groq API Key — [get free key](https://console.groq.com)"
        key_ph    = "gsk_…"
    elif provider == "gemini":
        model = st.selectbox("Model", ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"], label_visibility="collapsed")
        key_label = "Google API Key — [AI Studio](https://aistudio.google.com/app/apikey)"
        key_ph    = "AIza…"
    else:  # huggingface
        model = st.selectbox("Model", HF_MODELS, label_visibility="collapsed")
        key_label = "HuggingFace Token — [get token](https://huggingface.co/settings/tokens)"
        key_ph    = "hf_…"

    st.markdown(f'<p style="font-size:0.75rem;color:#64748b;margin:0.4rem 0 0.2rem">{key_label}</p>', unsafe_allow_html=True)
    api_key = st.text_input("API Key", type="password", placeholder=key_ph, label_visibility="collapsed")

    if api_key:
        st.success(f"Key set ✓", icon="🔑")

    st.divider()
    st.markdown('<p class="cs-section">📦 Repository</p>', unsafe_allow_html=True)

    repo_url = st.text_input(
        "GitHub URL",
        placeholder="https://github.com/owner/repo",
        label_visibility="collapsed",
    )

    index_btn = st.button(
        "🚀 Index Repository",
        type="primary",
        use_container_width=True,
        disabled=(not repo_url or not api_key),
    )

    # ── Current repo status ──────────────────────────────────────────────────
    if st.session_state.rag_chain:
        st.divider()
        st.markdown('<p class="cs-section"> Indexed Repo</p>', unsafe_allow_html=True)
        st.markdown(
            f'<span class="status-dot dot-green"></span>'
            f'**{st.session_state.repo_name}**',
            unsafe_allow_html=True,
        )
        st.caption(f"{st.session_state.doc_count} chunks indexed")

        if st.session_state.lang_stats:
            lang_colors = {
                "Python": "#3b82f6", "JavaScript": "#f59e0b", "TypeScript": "#06b6d4",
                "Java": "#f97316", "Go": "#10b981", "Rust": "#ef4444",
                "C++": "#8b5cf6", "C": "#64748b", "Ruby": "#ec4899",
            }
            badges = ""
            for lang, count in sorted(st.session_state.lang_stats.items(), key=lambda x: -x[1]):
                col = lang_colors.get(lang, "#64748b")
                badges += f'<span class="lang-badge" style="background:{col}22;color:{col};border:1px solid {col}44">{lang} {count}</span>'
            st.markdown(badges, unsafe_allow_html=True)

        if st.button("🗑️ Clear Chat", use_container_width=True):
            st.session_state.messages = []
            st.rerun()

        if st.button("🔄 Re-index", use_container_width=True):
            st.session_state.rag_chain = None
            st.session_state.indexed_url = None
            st.session_state.messages = []
            st.rerun()

    st.divider()
    st.markdown(
        '<div style="font-size:0.73rem;color:#334155;line-height:1.6">'
        '🧠 <b>Gemini 2.0 Flash</b> (generation)<br>'
        '📐 <b>all-MiniLM-L6-v2</b> (local, CPU-fast)<br>'
        '🗄️ <b>ChromaDB</b> + MMR search<br>'
        '🌿 <b>AST chunking</b> for Python<br>'
        '⚡ <b>Shallow clone</b> for speed'
        '</div>',
        unsafe_allow_html=True,
    )

# ─────────────────────────────────────────────────────────────────────────────
# Hero Header
# ─────────────────────────────────────────────────────────────────────────────
st.markdown("""
<div class="cs-hero">
    <div class="cs-logo">🔭 CodeScope AI</div>
    <div class="cs-tagline">AST-powered codebase intelligence &nbsp;·&nbsp; RAG &nbsp;·&nbsp; Gemini</div>
</div>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────────────────────
# Indexing flow
# ─────────────────────────────────────────────────────────────────────────────
if index_btn:
    # ── Force Reset ──────────────────────────────────────────────────────
    st.session_state.rag_chain = None
    st.session_state.messages = []
    st.session_state.indexed_url = None
    
    if not api_key:
        st.error("Please enter an API Key first!")
        st.stop()
    if not repo_url:
        st.error("Please enter a Repository URL!")
        st.stop()
        
    prog_bar  = st.progress(0, text="Initialising…")
    prog_text = st.empty()

    def on_progress(msg: str, pct: int):
        prog_bar.progress(pct, text=msg)
        prog_text.info(msg)

    try:
        with st.spinner(""):
            chain, repo_name, doc_count, lang_stats = build_rag_chain(
                repo_url.strip(), api_key.strip(),
                provider=provider, model=model,
                progress_cb=on_progress,
            )
        st.session_state.rag_chain   = chain
        st.session_state.indexed_url = repo_url.strip()
        st.session_state.repo_name   = repo_name
        st.session_state.doc_count   = doc_count
        st.session_state.lang_stats  = lang_stats
        st.session_state.messages    = []
        st.success(f"Indexed {repo_name} successfully!", icon="✅")
        st.rerun()
    except Exception as e:
        st.error(f"Indexing failed: {e}")

# ─────────────────────────────────────────────────────────────────────────────
# Stats row (shown when a repo is indexed)
# ─────────────────────────────────────────────────────────────────────────────
if st.session_state.rag_chain:
    repo_link = st.session_state.indexed_url
    lang_list = ", ".join(st.session_state.lang_stats.keys())
    st.markdown(f"""
    <div class="cs-stats">
        <div class="cs-pill"><span class="status-dot dot-green" style="width:6px;height:6px"></span> Live</div>
        <div class="cs-pill">🗂️ <span>{st.session_state.repo_name}</span></div>
        <div class="cs-pill">📦 <span>{st.session_state.doc_count}</span> chunks</div>
        <div class="cs-pill">🌐 <span>{lang_list or "—"}</span></div>
        <div class="cs-pill">🤖 <span>Gemini 2.0 Flash</span></div>
    </div>
    """, unsafe_allow_html=True)
    st.divider()

# ─────────────────────────────────────────────────────────────────────────────
# Chat area
# ─────────────────────────────────────────────────────────────────────────────
chat_container = st.container()

with chat_container:
    if not st.session_state.rag_chain:
        st.markdown("""
        <div class="cs-empty">
            <div class="cs-empty-icon">🔭</div>
            <h3>No repository indexed yet</h3>
            <p>Enter a GitHub URL and your Google API key in the sidebar,<br>
            then click <strong>Index Repository</strong> to get started.</p>
        </div>
        """, unsafe_allow_html=True)
    else:
        if not st.session_state.messages:
            st.markdown("""
            <div class="cs-empty">
                <div class="cs-empty-icon">💬</div>
                <h3>Ask anything about the codebase</h3>
                <p>e.g. <em>"How does authentication work?"</em> &nbsp;·&nbsp;
                <em>"What does the Cache class do?"</em> &nbsp;·&nbsp;
                <em>"Explain the main entry point"</em></p>
            </div>
            """, unsafe_allow_html=True)

        # Render existing messages
        for msg in st.session_state.messages:
            if msg["role"] == "user":
                st.markdown(f"""
                <div class="msg-wrap">
                    <div class="msg-label-user">You</div>
                    <div class="msg-user">{msg["content"]}</div>
                </div>
                """, unsafe_allow_html=True)
            # AI messages
            if msg["role"] == "ai":
                with st.chat_message("assistant", avatar="🔭"):
                    st.markdown(msg["content"])

# ─────────────────────────────────────────────────────────────────────────────
# Question input (pinned to bottom via form)
# ─────────────────────────────────────────────────────────────────────────────
if st.session_state.rag_chain:
    with st.form("chat_form", clear_on_submit=True):
        col_q, col_send = st.columns([11, 1], vertical_alignment="bottom")
        with col_q:
            question = st.text_input(
                "question",
                placeholder="Ask a question about the codebase…",
                label_visibility="collapsed",
            )
        with col_send:
            send = st.form_submit_button("➤", type="primary", use_container_width=True)

    if send and question.strip():
        q = question.strip()
        st.session_state.messages.append({"role": "user", "content": q})

        # Stream AI response — fall back to invoke() if streaming unsupported
        try:
            with st.chat_message("assistant", avatar="🔭"):
                try:
                    full_answer = st.write_stream(stream_answer(st.session_state.rag_chain, q))
                except NotImplementedError:
                    # Some providers (e.g. HuggingFace) don't support streaming
                    full_answer = st.session_state.rag_chain.invoke(q)
                    st.markdown(str(full_answer))

            st.session_state.messages.append({"role": "ai", "content": str(full_answer)})
            st.rerun()   # ← only on success

        except Exception as exc:
            # Remove the orphaned user message so it doesn't show unanswered
            if st.session_state.messages and st.session_state.messages[-1]["role"] == "user":
                st.session_state.messages.pop()
            st.error(f"❌ {exc}", icon="🚨")
            # Don't rerun — let the error stay visible

