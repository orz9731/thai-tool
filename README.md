# 🔤 泰語拼音工具 (Thai Phonetic Tool)

Interactive Thai language learning tool with TTS support.

## Features
- Thai consonant, vowel, and final selector
- Automatic tone calculation
- Text-to-Speech with multiple voice options
- Practice history & vocabulary tracking
- Tone quiz mode
- Mobile responsive

## Setup

### Prerequisites
- Netlify account (for hosting)
- Google Cloud TTS API key

### Environment Variables
Set on Netlify Site Settings:
- `GCP_TTS_KEY`: Your Google Cloud Text-to-Speech API key

### Deploy to Netlify
1. Connect your GitHub repository to Netlify
2. Add the `GCP_TTS_KEY` environment variable in Site Settings
3. Deploy!

## Security
- API key is **never exposed** to frontend
- All TTS calls go through Netlify Edge Function proxy
- Server-side validation & error handling

## License
MIT
