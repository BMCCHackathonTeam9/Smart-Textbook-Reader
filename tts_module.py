from gtts import gTTS

# Convert text to speech
textbook_text = """
Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide 
to create oxygen and energy in the form of sugar. This process is essential for life on Earth.
"""
tts = gTTS(textbook_text)
# Save as MP3 file
tts.save("long_test_audio.mp3")

print("Audio file created! Check your folder for test_audio.mp3")
