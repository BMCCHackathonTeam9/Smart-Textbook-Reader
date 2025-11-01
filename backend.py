from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import tempfile
from pathlib import Path
from ocr_module import extract_text_from_pdf
from gtts import gTTS
import uuid
import traceback

app = Flask(__name__)
CORS(app)

# Create directories for temporary files
TEMP_DIR = Path("temp")
TEMP_DIR.mkdir(exist_ok=True)

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Smart Textbook Reader API is running'})

@app.route('/api/process-pdf', methods=['POST'])
def process_pdf():
    """Process uploaded PDF: extract text and generate audio"""
    try:
        if 'pdf' not in request.files:
            return jsonify({'error': 'No PDF file uploaded'}), 400
        
        pdf_file = request.files['pdf']
        if pdf_file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not pdf_file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'File must be a PDF'}), 400

        # Save uploaded PDF temporarily
        temp_pdf_path = TEMP_DIR / f"{uuid.uuid4().hex}.pdf"
        pdf_file.save(temp_pdf_path)
        
        try:
            # Extract text using OCR module
            print(f"Processing PDF: {pdf_file.filename}")
            extracted_text = extract_text_from_pdf(str(temp_pdf_path))
            
            if not extracted_text.strip():
                return jsonify({'error': 'No text could be extracted from the PDF'}), 400
            
            # Generate audio using TTS
            print("Generating audio from extracted text...")
            audio_filename = f"{uuid.uuid4().hex}.mp3"
            audio_path = TEMP_DIR / audio_filename
            
            # Limit text length for TTS (gTTS has character limits)
            max_chars = 4000  # Adjust based on your needs
            text_for_tts = extracted_text[:max_chars]
            if len(extracted_text) > max_chars:
                text_for_tts += "... (text truncated for audio generation)"
            
            tts = gTTS(text=text_for_tts, lang='en', slow=False)
            tts.save(str(audio_path))
            
            print(f"Successfully processed PDF. Text length: {len(extracted_text)} chars")
            
            return jsonify({
                'success': True,
                'text': extracted_text,
                'audioUrl': f'/api/audio/{audio_filename}',
                'message': f'Successfully extracted {len(extracted_text)} characters'
            })
            
        finally:
            # Clean up uploaded PDF
            if temp_pdf_path.exists():
                temp_pdf_path.unlink()
                
    except Exception as e:
        print(f"Error processing PDF: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': f'Failed to process PDF: {str(e)}'}), 500

@app.route('/api/text-to-speech', methods=['POST'])
def text_to_speech():
    """Convert text to speech"""
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Limit text length for TTS
        max_chars = 4000
        text_for_tts = text[:max_chars]
        if len(text) > max_chars:
            text_for_tts += "... (text truncated for audio generation)"
        
        # Generate audio
        audio_filename = f"{uuid.uuid4().hex}.mp3"
        audio_path = TEMP_DIR / audio_filename
        
        print(f"Generating TTS for {len(text_for_tts)} characters")
        tts = gTTS(text=text_for_tts, lang='en', slow=False)
        tts.save(str(audio_path))
        
        return jsonify({
            'success': True,
            'audioUrl': f'/api/audio/{audio_filename}',
            'message': f'Generated audio for {len(text_for_tts)} characters'
        })
        
    except Exception as e:
        print(f"Error in text-to-speech: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': f'Failed to generate audio: {str(e)}'}), 500

@app.route('/api/audio/<filename>')
def serve_audio(filename):
    """Serve generated audio files"""
    try:
        audio_path = TEMP_DIR / filename
        if audio_path.exists() and audio_path.suffix == '.mp3':
            return send_file(str(audio_path), mimetype='audio/mpeg')
        return jsonify({'error': 'Audio file not found'}), 404
    except Exception as e:
        print(f"Error serving audio: {str(e)}")
        return jsonify({'error': 'Failed to serve audio file'}), 500

@app.errorhandler(413)
def too_large(e):
    return jsonify({'error': 'File too large. Please upload a PDF smaller than 50MB.'}), 413

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error occurred'}), 500

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Starting Smart Textbook Reader Backend Server")
    print("=" * 60)
    print("📱 React Frontend: http://localhost:3000")
    print("🔧 API Backend: http://localhost:5000")
    print("📋 Health Check: http://localhost:5000/api/health")
    print("=" * 60)
    print("📝 Instructions:")
    print("1. Start this backend server: python backend.py")
    print("2. In another terminal, start React: cd frontend && npm start")
    print("3. Open http://localhost:3000 in your browser")
    print("=" * 60)
    
    # Configure upload limits
    app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB limit
    
    app.run(debug=True, host='0.0.0.0', port=5000)