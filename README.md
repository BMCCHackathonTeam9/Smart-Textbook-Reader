# Smart Textbook Reader

A modern web application that extracts text from PDF textbooks and images using OCR and converts it to speech, running entirely in the browser.

## 🚀 Features

- **📱 Modern React UI** with styled-components
- **📄 PDF & Image Processing** - Upload PDFs or images for text extraction
- **🔍 Cloud OCR** - Uses OCR.space API for reliable text extraction
- **🔊 Text-to-Speech** - Browser-native Web Speech API
- **🎵 Audio Controls** - Play, pause, and control speech playback
- **📱 Fully Responsive** - Works on desktop and mobile
- **🎨 Beautiful Design** - Gradient themes and smooth animations
- **♿ Accessible** - Built with accessibility in mind
- **☁️ Deployed on Vercel** - No backend server needed

## 🏗️ Architecture

This is a **client-side React application** that:
- Runs entirely in the browser (no backend server)
- Uses OCR.space API for OCR processing
- Uses Web Speech API for text-to-speech
- Processes PDFs with PDF.js in the browser
- Deploys as static files on Vercel

## 📁 Project Structure

```
Smart-Textbook-Reader/
├── frontend/                 # React application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── FileUpload.js
│   │   │   ├── TextDisplay.js
│   │   │   ├── AudioControls.js
│   │   │   └── common.js    # Reusable styled components
│   │   ├── services/        # Client-side services
│   │   │   └── clientOCR.js # OCR & TTS logic
│   │   ├── styles/          # Theme system
│   │   │   └── theme.js
│   │   ├── App.js           # Main application
│   │   └── index.js         # Entry point
│   ├── package.json
│   └── build/               # Production build output
├── vercel.json              # Vercel deployment config
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- **Node.js 16+** and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
cd frontend
npm run build
```

The production build will be in `frontend/build/`

## 🎯 Usage

1. **Open the app** in your browser
2. **Upload a file:**
   - Drag and drop a PDF or image
   - Or click to browse and select
3. **Processing:**
   - PDF pages are converted to images
   - Images are sent to OCR.space API for text extraction
   - Extracted text appears in the display area
4. **Text-to-Speech:**
   - Click "Play" to hear the text read aloud
   - Use pause/resume controls as needed
5. **Edit & Download:**
   - Edit extracted text if needed
   - Copy to clipboard or download as text file

## 🎨 Styling with Styled Components

### Theme System
Located in `frontend/src/styles/theme.js`:
- Consistent color palette with gradients
- Typography system (Poppins font)
- Spacing scale
- Responsive breakpoints
- Shadow and border-radius tokens

### Reusable Components
All in `frontend/src/components/common.js`:
- `Button`, `Card`, `Text`, `Heading`
- `Flex`, `Grid` for layouts
- `LoadingSpinner`, `Input`, `TextArea`
- Fully themeable and responsive

### Example Component

```jsx
import styled from 'styled-components';
import { Button, Card } from './components/common';

const CustomCard = styled(Card)`
  background: ${({ theme }) => theme.colors.primary.gradient};
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
  }
`;
```

## 🔧 Technical Details

### OCR Processing
- **Library:** OCR.space API (free tier)
- **Process:** 
  1. PDF converted to images using PDF.js
  2. Images compressed to JPEG format
  3. Sent to OCR.space API
  4. Text extracted and displayed

### Text-to-Speech
- **Library:** Web Speech API (browser native)
- **Features:**
  - No external dependencies
  - Works offline after page load
  - Automatic text chunking for long content
  - Play/pause/resume controls

### PDF Processing
- **Library:** PDF.js
- **Process:**
  1. PDF loaded in browser memory
  2. Each page rendered to canvas
  3. Canvas converted to JPEG blob
  4. Blobs sent for OCR processing

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd Smart-Textbook-Reader
vercel --prod
```

**Configuration:**
- Framework: Create React App
- Build Command: `cd frontend && npm run build`
- Output Directory: `frontend/build`
- Root Directory: `./`

### Manual Deployment

```bash
# Build the app
cd frontend
npm run build

# Deploy the frontend/build folder to any static hosting:
# - Netlify
# - GitHub Pages
# - AWS S3
# - Firebase Hosting
```

## ⚙️ Configuration

### OCR.space API
Located in `frontend/src/services/clientOCR.js`:
```javascript
this.apiKey = 'K87899142388957'; // Free public key
this.apiUrl = 'https://api.ocr.space/parse/image';
```

**Limitations:**
- 1MB file size limit per request
- Free tier rate limits apply
- Mobile users may see smaller limits

### Theme Customization
Edit `frontend/src/styles/theme.js`:
```javascript
export const theme = {
  colors: {
    primary: {
      main: '#667eea',
      light: '#a8b9ff',
      dark: '#4c51bf',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }
  }
};
```

## � Troubleshooting

### Common Issues

**PDF Upload Fails:**
- Check console for errors
- Try with smaller PDF (< 5 pages recommended)
- Ensure PDF is not password-protected

**OCR Not Working:**
- Check internet connection (API requires connection)
- OCR.space API may have rate limits
- Try uploading as individual images instead

**Text-to-Speech Not Working:**
- Check browser compatibility (modern browsers required)
- Ensure browser permissions allow audio
- Some browsers require user interaction first

**Mobile Issues:**
- File size limits may be stricter (1MB)
- Compress images before uploading
- Try fewer pages at a time

## 📱 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE 11 (not supported)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly
4. Commit: `git commit -m 'Add feature'`
5. Push: `git push origin feature-name`
6. Open Pull Request

## 📄 License

MIT License - feel free to use this project for learning or production.

## 🙏 Acknowledgments

- OCR.space for free OCR API
- PDF.js by Mozilla
- Web Speech API
- Vercel for hosting
- Styled-components team

---

**Built with ❤️ for BMCC Hackathon Team 9**

For questions or issues, open a GitHub issue or contact the team.