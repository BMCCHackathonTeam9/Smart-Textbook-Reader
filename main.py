from ocr_module import extract_text_from_pdf

pdf_path = "samples/book_.pdf"

text = extract_text_from_pdf(pdf_path)
print(text)
