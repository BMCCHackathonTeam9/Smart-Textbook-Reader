# Smart Textbook Reader - React + Styled Components Setup

A modern web application that extracts text from PDF textbooks and converts it to speech using AI-powered OCR and TTS.

## 🚀 Features

- **📱 Modern React UI** with styled-components
- **📄 PDF Text Extraction** using advanced OCR
- **🔊 Text-to-Speech** conversion
- **🎵 Audio Player** with full controls
- **📱 Responsive Design** for all devices
- **🎨 Beautiful Animations** and interactions
- **♿ Accessibility Features** included

## 📁 Project Structure

```
Smart-Textbook-Reader/
├── frontend/                 # React frontend
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── styles/          # Theme and global styles
│   │   └── services/        # API services
│   └── package.json
├── backend.py               # Flask API server
├── ocr_module.py           # OCR functionality
├── tts_module.py           # Text-to-speech (legacy)
├── requirement.txt         # Python dependencies
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- **Python 3.8+**
- **Node.js 16+** and npm
- **Tesseract OCR** installed on your system

#### Install Tesseract OCR:

**macOS:**
```bash
brew install tesseract
```

**Ubuntu/Debian:**
```bash
sudo apt-get install tesseract-ocr
```

**Windows:**
Download from: https://github.com/UB-Mannheim/tesseract/wiki

### 1. Backend Setup

```bash
# Install Python dependencies
pip install -r requirement.txt

# Start the Flask backend server
python backend.py
```

The backend will be available at: `http://localhost:5000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install React dependencies
npm install

# Start the React development server
npm start
```

The frontend will be available at: `http://localhost:3000`

## 🎯 Usage

1. **Start both servers** (backend and frontend)
2. **Open your browser** to `http://localhost:3000`
3. **Upload a PDF** by dragging and dropping or clicking to browse
4. **Wait for processing** - text extraction and audio generation
5. **View extracted text** in the text display area
6. **Play audio** using the built-in audio controls
7. **Edit text** if needed and regenerate audio

## 🎨 Styling with Styled Components

The project uses styled-components for all styling. Key features:

### Theme System
- Consistent colors, typography, and spacing
- Dark/light mode ready
- Responsive breakpoints

### Reusable Components
- `Button`, `Card`, `Text`, `Heading`
- `Flex`, `Grid` layout components
- `LoadingSpinner`, `Input`, `TextArea`

### Responsive Design
- Mobile-first approach
- Flexible grid system
- Touch-friendly interactions

## 🔧 Customization

### Adding Figma Designs

1. **Export from Figma:**
   - Use Figma-to-React plugins
   - Export assets to `frontend/src/assets/`
   - Copy CSS properties

2. **Update Components:**
   - Modify existing styled components
   - Add new component files
   - Update theme variables

3. **Preserve Functionality:**
   - Keep existing component props
   - Maintain accessibility features
   - Test all interactions

### Example: Custom Button Component

```jsx
import styled from 'styled-components';

const CustomButton = styled.button`
  background: ${({ theme }) => theme.colors.primary.gradient};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 100%;
  }
`;
```

### Updating Theme

Edit `frontend/src/styles/theme.js`:

```javascript
export const theme = {
  colors: {
    primary: {
      main: '#your-color',
      gradient: 'linear-gradient(135deg, #color1 0%, #color2 100%)'
    }
    // ... more colors
  }
  // ... typography, spacing, etc.
};
```

## 🚀 Production Build

### Frontend
```bash
cd frontend
npm run build
```

### Backend
For production, use a WSGI server like Gunicorn:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 backend:app
```

## 🐛 Troubleshooting

### Common Issues

1. **Backend not starting:**
   - Check Python dependencies: `pip install -r requirement.txt`
   - Verify Tesseract installation: `which tesseract`

2. **Frontend not connecting:**
   - Ensure backend is running on port 5000
   - Check CORS configuration
   - Verify proxy setting in `package.json`

3. **OCR not working:**
   - Update Tesseract path in `ocr_module.py`
   - Test with: `pytesseract.image_to_string(test_image)`

4. **Styling issues:**
   - Check browser console for errors
   - Verify styled-components installation
   - Test theme provider setup

### Development Tips

- Use React Developer Tools for debugging
- Check Network tab for API calls
- Enable Flask debug mode for backend errors
- Use styled-components browser extension

## 📚 API Endpoints

- `GET /api/health` - Health check
- `POST /api/process-pdf` - Upload PDF and extract text
- `POST /api/text-to-speech` - Convert text to audio
- `GET /api/audio/<filename>` - Serve audio files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

---

**Happy coding!** 🎉 If you have any questions or need help, feel free to open an issue.