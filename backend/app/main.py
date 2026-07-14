"""
app.py — CodeScope AI  Streamlit frontend
Premium dark-theme UI with live streaming answers and chat history.
"""

import os
# Silences Hugging Face Transformers module warning messages on start
os.environ["TRANSFORMERS_VERBOSITY"] = "error"
os.environ["TRANSFORMERS_NO_ADVISORY_WARNINGS"] = "1"

import hashlib
from html import escape

import streamlit as st
from rag_engine import (
    build_rag_chain,
    rebuild_rag_chain,
    stream_answer,
    clean_markdown,
    LLM_PROVIDERS,
    GROQ_MODELS,
    HF_MODELS,
    GEMINI_MODELS,
)

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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@400;500;600;700;800&display=swap');

/* ── Base ── */
html, body, [class*="css"] { 
    font-family: 'Outfit', 'Inter', sans-serif; 
}
.stApp { 
    background: radial-gradient(circle at 50% 0%, #161824 0%, #0b0c11 100%); 
}
.block-container {
    max-width: 980px;
    padding-top: 2rem;
    padding-bottom: 6rem;
}

/* ── Top gradient bar ── */
section[data-testid="stSidebar"] ~ div [data-testid="stAppViewContainer"]::before,
[data-testid="stHeader"] {
    background: transparent;
}
[data-testid="stHeader"]::after {
    content: "";
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, #6366f1, #a855f7, #ec4899, #f59e0b);
    z-index: 9999;
}

/* ── Hero ── */
.cs-hero {
    padding: 1.5rem 0 2rem 0;
    text-align: center;
}
.cs-logo {
    font-size: 2.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, #a5b4fc 0%, #c084fc 50%, #f472b6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.02em;
    filter: drop-shadow(0 2px 8px rgba(168, 85, 247, 0.2));
}
.cs-tagline {
    color: #94a3b8;
    font-size: 0.95rem;
    margin-top: 0.5rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-weight: 600;
}

/* ── Status dot ── */
.status-dot {
    display: inline-block;
    width: 10px; height: 10px;
    border-radius: 50%;
    margin-right: 8px;
    vertical-align: middle;
}
.dot-green  { 
    background: #10b981; 
    box-shadow: 0 0 10px #10b981; 
    animation: statusPulse 2s infinite ease-in-out;
}
.dot-grey   { background: #64748b; }

@keyframes statusPulse {
    0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 8px #10b981; }
    50% { transform: scale(1.2); opacity: 0.7; box-shadow: 0 0 16px #10b981; }
}

/* ── Stat pills ── */
.cs-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin: 1rem 0 1.5rem 0;
    justify-content: center;
}
.cs-pill {
    background: rgba(30, 41, 59, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    padding: 0.35rem 1rem;
    font-size: 0.8rem;
    color: #94a3b8;
    font-weight: 500;
    backdrop-filter: blur(12px);
    transition: all 0.2s ease-in-out;
}
.cs-pill:hover {
    border-color: rgba(168, 85, 247, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(168, 85, 247, 0.1);
}
.cs-pill span { color: #a5b4fc; font-weight: 600; }

/* ── Chat bubbles ── */
.chat-thread {
    min-height: 52vh;
    padding: 0.5rem 0;
}
.msg-wrap {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin: 1.2rem 0;
    animation: fadeInUp 0.3s ease-out;
}
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.msg-user {
    align-self: flex-end;
    max-width: min(80%, 720px);
    background: linear-gradient(135deg, #312e81 0%, #1e1b4b 100%);
    color: #f8fafc;
    padding: 0.85rem 1.2rem;
    border-radius: 18px 18px 2px 18px;
    font-size: 0.98rem;
    line-height: 1.55;
    border: 1px solid rgba(99, 102, 241, 0.2);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}
.msg-label-user {
    align-self: flex-end;
    font-size: 0.75rem;
    color: #818cf8;
    margin-bottom: 2px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

/* Streamlit's chat elements customization */
.stChatMessage {
    background: rgba(255, 255, 255, 0.02) !important;
    border: 1px solid rgba(255, 255, 255, 0.04) !important;
    border-radius: 16px !important;
    padding: 1rem !important;
    margin: 1rem 0 !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
    backdrop-filter: blur(8px) !important;
}
.stChatMessage [data-testid="chatAvatarIcon-assistant"] {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%) !important;
    border: none !important;
    box-shadow: 0 0 10px rgba(124, 58, 237, 0.5) !important;
}
.st-chat-message-content {
    white-space: pre-wrap;
}
.st-chat-message-content p {
    color: #f1f5f9;
    line-height: 1.7;
    font-size: 0.98rem;
}
.st-chat-message-content code {
    color: #f472b6;
    background: rgba(244, 114, 182, 0.1);
    padding: 0.2rem 0.4rem;
    border-radius: 6px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.88rem;
    border: 1px solid rgba(244, 114, 182, 0.15);
}
.st-chat-message-content pre {
    background: #090d16 !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 10px !important;
    padding: 1.2rem !important;
    margin: 1.2rem 0 !important;
}

/* Streamlit chat input customization */
[data-testid="stChatInput"] {
    border-radius: 20px !important;
    background: rgba(18, 20, 29, 0.8) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.5) !important;
    backdrop-filter: blur(15px) !important;
}
[data-testid="stChatInput"] textarea {
    color: #f1f5f9 !important;
}

/* ── Empty state ── */
.cs-empty {
    text-align: center;
    padding: 4rem 2rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px dashed rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    margin: 2rem 0;
    backdrop-filter: blur(10px);
}
.cs-empty-icon { 
    font-size: 4rem; 
    margin-bottom: 1rem;
    filter: drop-shadow(0 0 12px rgba(99, 102, 241, 0.3));
    animation: floatIcon 3s infinite ease-in-out;
}
@keyframes floatIcon {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
}
.cs-empty h3 { 
    color: #e2e8f0; 
    font-weight: 700; 
    font-size: 1.3rem; 
    letter-spacing: -0.01em;
}
.cs-empty p { 
    color: #94a3b8; 
    font-size: 0.95rem; 
    line-height: 1.7; 
    margin-top: 0.5rem;
}

/* ── Sidebar ── */
[data-testid="stSidebar"] { 
    background: #06090e !important; 
    border-right: 1px solid rgba(255, 255, 255, 0.04);
}
[data-testid="stSidebar"] hr { 
    border-color: rgba(255, 255, 255, 0.06); 
}

/* ── Section headers ── */
.cs-section {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    color: #64748b;
    text-transform: uppercase;
    margin: 1.5rem 0 0.6rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    padding-bottom: 0.4rem;
}

/* ── Language badge ── */
.lang-badge {
    display: inline-block;
    border-radius: 6px;
    padding: 3px 9px;
    font-size: 0.75rem;
    font-weight: 600;
    margin: 3px;
    transition: all 0.2s ease-in-out;
}
.lang-badge:hover {
    transform: scale(1.05);
}
</style>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────────────────────
# Session state defaults
# ─────────────────────────────────────────────────────────────────────────────
defaults = {
    "rag_chain": None,
    "retriever": None,
    "indexed_url": None,
    "repo_name": "",
    "doc_count": 0,
    "lang_stats": {},
    "messages": [],        # list of {"role": "user"|"ai", "content": str}
    "indexed_provider": "",
    "indexed_model": "",
    "indexed_api_key_hash": "",
}
for k, v in defaults.items():
    if k not in st.session_state:
        st.session_state[k] = v


def _api_key_hash(api_key: str) -> str:
    key = (api_key or "").strip()
    if not key:
        return ""
    return hashlib.sha256(key.encode("utf-8")).hexdigest()


def _clear_indexed_chain() -> None:
    st.session_state.rag_chain = None
    st.session_state.retriever = None
    st.session_state.indexed_url = None
    st.session_state.repo_name = ""
    st.session_state.doc_count = 0
    st.session_state.lang_stats = {}
    st.session_state.messages = []
    st.session_state.indexed_provider = ""
    st.session_state.indexed_model = ""
    st.session_state.indexed_api_key_hash = ""


def _looks_like_language_question(question: str) -> bool:
    q = question.lower()
    return (
        ("language" in q or "languages" in q or "programming" in q)
        and any(word in q for word in ("used", "repo", "repository", "this", "codebase"))
    )


def _language_stats_answer() -> str:
    stats = st.session_state.lang_stats or {}
    if not stats:
        return "I could not find language statistics for the indexed repository."

    total = sum(stats.values())
    rows = []
    for lang, count in sorted(stats.items(), key=lambda x: -x[1]):
        pct = (count / total * 100) if total else 0
        rows.append(f"- **{lang}**: {count} indexed chunks ({pct:.1f}%)")

    return (
        "The indexed repository contains these programming languages:\n\n"
        + "\n".join(rows)
        + "\n\nThese counts are based on the source chunks CodeScope indexed, not raw lines of code."
    )

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
        key="selected_provider",
        label_visibility="collapsed",
    )

    # Dynamic model selector
    if provider == "groq":
        model = st.selectbox("Model", GROQ_MODELS, key="selected_groq_model", label_visibility="collapsed")
        key_label = "Groq API Key — [get free key](https://console.groq.com)"
        key_ph    = "gsk_…"
    elif provider == "gemini":
        model = st.selectbox("Model", GEMINI_MODELS, key="selected_gemini_model", label_visibility="collapsed")
        key_label = "Google API Key — [AI Studio](https://aistudio.google.com/app/apikey)"
        key_ph    = "AIza…"
    else:  # huggingface
        model = st.selectbox("Model", HF_MODELS, key="selected_hf_model", label_visibility="collapsed")
        key_label = "HuggingFace Token — [get token](https://huggingface.co/settings/tokens)"
        key_ph    = "hf_…"

    st.markdown(f'<p style="font-size:0.75rem;color:#64748b;margin:0.4rem 0 0.2rem">{key_label}</p>', unsafe_allow_html=True)
    api_key = st.text_input("API Key", type="password", placeholder=key_ph, key="api_key", label_visibility="collapsed")

    if api_key:
        st.success(f"Key set ✓", icon="🔑")

    active_api_key_hash = _api_key_hash(api_key)
    indexed_config_changed = (
        st.session_state.rag_chain
        and (
            st.session_state.indexed_provider != provider
            or st.session_state.indexed_model != model
            or (
                active_api_key_hash
                and st.session_state.indexed_api_key_hash != active_api_key_hash
            )
        )
    )
    if indexed_config_changed:
        if st.session_state.retriever and api_key:
            try:
                with st.spinner("Swapping LLM model..."):
                    st.session_state.rag_chain = rebuild_rag_chain(
                        st.session_state.retriever,
                        provider=provider,
                        api_key=api_key.strip(),
                        model=model,
                    )
                st.session_state.indexed_provider = provider
                st.session_state.indexed_model = model
                st.session_state.indexed_api_key_hash = active_api_key_hash
                st.success("LLM configuration updated successfully!", icon="⚡")
            except Exception as e:
                st.error(f"Failed to update LLM: {e}")
        else:
            _clear_indexed_chain()

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
            _clear_indexed_chain()
            st.rerun()

    st.divider()
    st.markdown(
        '<div style="font-size:0.73rem;color:#334155;line-height:1.6">'
        f'🧠 <b>{LLM_PROVIDERS[provider]} / {model}</b> (generation)<br>'
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
    _clear_indexed_chain()
    
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
            chain, retriever, repo_name, doc_count, lang_stats = build_rag_chain(
                repo_url.strip(), api_key.strip(),
                provider=provider, model=model,
                progress_cb=on_progress,
            )
        st.session_state.rag_chain   = chain
        st.session_state.retriever   = retriever
        st.session_state.indexed_url = repo_url.strip()
        st.session_state.repo_name   = repo_name
        st.session_state.doc_count   = doc_count
        st.session_state.lang_stats  = lang_stats
        st.session_state.messages    = []
        st.session_state.indexed_provider = provider
        st.session_state.indexed_model = model
        st.session_state.indexed_api_key_hash = active_api_key_hash
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
        <div class="cs-pill">🤖 <span>{st.session_state.indexed_provider} / {st.session_state.indexed_model}</span></div>
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
            <p>Enter a GitHub URL and your API key in the sidebar,<br>
            then click <strong>Index Repository</strong> to get started.</p>
        </div>
        """, unsafe_allow_html=True)
    else:
        st.markdown('<div class="chat-thread">', unsafe_allow_html=True)
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
                safe_content = escape(msg["content"])
                st.markdown(f"""
                <div class="msg-wrap">
                    <div class="msg-label-user">You</div>
                    <div class="msg-user">{safe_content}</div>
                </div>
                """, unsafe_allow_html=True)
            elif msg["role"] == "ai":
                with st.chat_message("assistant", avatar="🔭"):
                    st.markdown(msg["content"])
        st.markdown('</div>', unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────────────────────
# Question input (pinned to bottom via chat_input)
# ─────────────────────────────────────────────────────────────────────────────
if st.session_state.rag_chain:
    question = st.chat_input("Ask a question about the codebase…")
    if question:
        q = question.strip()
        
        # Display the user message immediately in a chat bubble
        safe_content = escape(q)
        st.markdown(f"""
        <div class="msg-wrap">
            <div class="msg-label-user">You</div>
            <div class="msg-user">{safe_content}</div>
        </div>
        """, unsafe_allow_html=True)

        # Generate and stream the response
        try:
            with st.chat_message("assistant", avatar="🔭"):
                st.markdown('<div class="chat-pending">', unsafe_allow_html=True)
                if _looks_like_language_question(q):
                    full_answer = _language_stats_answer()
                    st.markdown(full_answer)
                else:
                    try:
                        with st.spinner("Thinking..."):
                            full_answer = st.write_stream(stream_answer(st.session_state.rag_chain, q))
                    except NotImplementedError:
                        # Some providers (e.g. HuggingFace) don't support streaming
                        full_answer = st.session_state.rag_chain.invoke(q)
                        st.markdown(str(full_answer))
                st.markdown('</div>', unsafe_allow_html=True)

            full_answer = clean_markdown(str(full_answer or ""))
            if not full_answer:
                raise RuntimeError(
                    "The model returned an empty response. Check the terminal for provider warnings, "
                    "or try re-indexing and asking again."
                )

            st.session_state.messages.append({"role": "user", "content": q})
            st.session_state.messages.append({"role": "ai", "content": full_answer})
            st.rerun()

        except Exception as exc:
            err_msg = (
                "**AI response failed.**\n\n"
                f"`{type(exc).__name__}: {exc}`\n\n"
                "If you are using Gemini, verify the API key is enabled for the selected model "
                "and check the terminal for quota or network errors."
            )
            st.session_state.messages.append({"role": "user", "content": q})
            st.session_state.messages.append({"role": "ai", "content": err_msg})
            st.rerun()
