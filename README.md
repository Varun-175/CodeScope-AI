# 🔭 CodeScope AI

**CodeScope AI** is a premium, AST-powered codebase intelligence tool designed to help developers explore and understand GitHub repositories through Retrieval-Augmented Generation (RAG). 

By combining the power of **Google Gemini**, **Groq**, and **HuggingFace** with advanced AST-level chunking, CodeScope AI provides precise, context-aware answers to complex questions about your code.

---

## ✨ Key Features

- **🚀 Instant Codebase Indexing**: Shallow-clones repositories for ultra-fast performance.
- **🌿 AST-Level Chunking**: 
  - Uses Python's standard `ast` library for deep Python understanding.
  - Leverages **Tree-sitter** for multilinear analysis of JavaScript, TypeScript, Java, C++, Rust, Go, and more.
- **🧠 Hybrid RAG Architecture**:
  - Local embeddings using `all-MiniLM-L6-v2` (high-speed, CPU-optimised).
  - Ephemeral in-memory **ChromaDB** vector store.
- **🤖 Multi-LLM Provider Support**:
  - **Groq**: Free, ultra-fast Llama 3.3-70B.
  - **Google Gemini**: State-of-the-art reasoning via Gemini 2.0 Flash.
  - **HuggingFace**: Access to thousands of open-source models (Mistral, Llama 3, etc.).
- **💎 Premium UI**: Sleek, dark-themed Streamlit interface with live streaming answers and interactive chat history.

---

## 🛠️ Technology Stack

- **Frontend**: Streamlit (Premium Custom CSS)
- **Orchestration**: LangChain
- **Vector DB**: ChromaDB
- **Embeddings**: HuggingFace (Sentence Transformers)
- **Parsing**: AST (Python) & Tree-sitter (Multi-language)
- **LLMs**: Google Gemini, Groq, HuggingFace Inference API

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have Python 3.9+ installed. You will also need API keys for at least one of the supported providers:
- [Google AI Studio](https://aistudio.google.com/app/apikey)
- [Groq Cloud](https://console.groq.com)
- [HuggingFace Settings](https://huggingface.co/settings/tokens)

### 2. Installation
Clone this repository and install the dependencies:

```bash
# Clone the project
git clone https://github.com/yourusername/CodeScope-AI.git
cd CodeScope-AI

# Install dependencies
pip install -r requirements.txt
```

### 3. Running the App
Navigate to the `basic` directory and launch the Streamlit server:

```bash
streamlit run app.py
```

---

## 📖 Usage

1. **Configure Provider**: Select your preferred LLM provider (e.g., Groq) and enter your API key in the sidebar.
2. **Index Repo**: Paste a GitHub repository URL and click **Index Repository**.
3. **Chat**: Once indexed, ask anything about the code! 
   - *"How does the main entry point work?"*
   - *"Explain the database connection logic."*
   - *"Find all the API endpoints defined in this project."*

---

## 🌍 Supported Languages (AST)

CodeScope AI uses advanced parsing to understand the structure of the following languages:
- **Python** (via `ast`)
- **JavaScript / TypeScript** (including JSX/TSX)
- **Java**, **Go**, **Rust**, **PHP**, **C#**
- **C / C++**

---

*Built with ❤️ for developers who want to see the big picture.*
