# Chemlife Chatbots — Dr. Kukku & Dr. Mikku

AI-powered chatbots for [Chemlife Innovations](https://chemlifeinnovations.com):

- **Dr. Kukku** — Poultry nutrition expert (MonoGastric products)
- **Dr. Mikku** — Dairy/ruminant nutrition expert

Both answer strictly about Chemlife products and knowledge, powered by Claude (Anthropic), Pinecone vector search, and deployed on AWS Lambda.

## Architecture

```
Website Widget (JS)  →  AWS API Gateway  →  AWS Lambda (FastAPI)
                                                  ↓
                                          Pinecone Vector DB
                                          Claude API (Anthropic)
```

## Quick Start

### 1. Install dependencies

```bash
pip install -r backend/requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your API keys
```

### 3. Collect data

```bash
python scripts/scrape_website.py
python scripts/fetch_blog.py
python scripts/fetch_youtube.py
python scripts/fetch_drive_pdfs.py
```

### 4. Process & embed

```bash
# Preview chunks (no upload)
python scripts/process_and_embed.py --dry-run

# Embed and upload to Pinecone
python scripts/process_and_embed.py
```

### 5. Run backend locally

```bash
uvicorn backend.app:app --reload
```

Test with curl:

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is ChemDmold?", "bot": "kukku", "history": []}'
```

### 6. Test widget locally

Open `widget/embed-snippet.html` in a browser (with the backend running).

## Deploy to AWS

```bash
cd backend/deploy
sam build
sam deploy --guided
```

## Project Structure

```
chemlife-chatbots/
├── data/                        # Scraped data (git-ignored)
│   ├── website/                 # Scraped product & tech pages
│   ├── blog/                    # WordPress blog posts
│   ├── youtube/                 # Video transcripts
│   └── fliers/                  # PDF flier text
├── scripts/
│   ├── config.py                # API keys & settings
│   ├── scrape_website.py        # Scrape chemlifeinnovations.com
│   ├── fetch_blog.py            # WordPress REST API puller
│   ├── fetch_youtube.py         # YouTube transcript extractor
│   ├── fetch_drive_pdfs.py      # Google Drive PDF downloader
│   └── process_and_embed.py     # Chunk, embed, upload to Pinecone
├── backend/
│   ├── app.py                   # FastAPI application
│   ├── rag.py                   # RAG pipeline
│   ├── prompts.py               # System prompts
│   ├── requirements.txt         # Python dependencies
│   └── deploy/
│       ├── Dockerfile           # Lambda container
│       └── template.yaml        # SAM/CloudFormation
├── widget/
│   ├── chatbot-widget.js        # Embeddable chat widget
│   ├── chatbot-widget.css       # Widget styles
│   └── embed-snippet.html       # Embed code & local test page
├── .env.example                 # Environment variable template
└── README.md
```

## Required API Keys

| Service | Purpose | Where to get |
|---------|---------|-------------|
| Anthropic | Claude API | https://console.anthropic.com |
| Pinecone | Vector DB | https://www.pinecone.io |
| Voyage AI **or** OpenAI | Embeddings | https://www.voyageai.com or https://platform.openai.com |
| YouTube Data API | Video listing | https://console.cloud.google.com |
| AWS | Lambda, API Gateway, S3 | https://aws.amazon.com |
