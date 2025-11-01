
# ocr_module.py  (PDF + image support)

import cv2
import pytesseract
from PIL import Image
import numpy as np
from pathlib import Path
from typing import Union, List
from pdf2image import convert_from_path

# ✅ UPDATE this based on "which tesseract"
pytesseract.pytesseract.tesseract_cmd = "/opt/homebrew/bin/tesseract"

BASE_DIR = Path(__file__).resolve().parent


# ----------------------------------------
# PDF HANDLING
# ----------------------------------------
def pdf_to_images(pdf_path: Union[str, Path]) -> List[Image.Image]:
    """
    Converts PDF pages into a list of PIL Images.
    """
    pdf_path = Path(pdf_path)
    if not pdf_path.is_absolute():
        pdf_path = BASE_DIR / pdf_path

    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    return convert_from_path(str(pdf_path))


# ----------------------------------------
# IMAGE LOADING
# ----------------------------------------
def _to_cv2_image(image_input):
    """
    Accepts path, PIL Image, or numpy array.
    Returns a cv2-compatible image.
    """
    if isinstance(image_input, (str, Path)):
        p = Path(image_input)
        if not p.is_absolute():
            p = BASE_DIR / p
        img = cv2.imread(str(p))
        if img is None:
            raise FileNotFoundError(f"Image not found or unreadable: {p}")
        return img

    if isinstance(image_input, Image.Image):
        return cv2.cvtColor(np.array(image_input), cv2.COLOR_RGB2BGR)

    if isinstance(image_input, np.ndarray):
        return image_input

    raise TypeError("Unsupported image type.")


# ----------------------------------------
# PREPROCESSING
# ----------------------------------------
def preprocess_image(image_input):
    img = _to_cv2_image(image_input)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    denoised = cv2.fastNlMeansDenoising(gray, h=30)
    thresh = cv2.adaptiveThreshold(
        denoised, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31, 8
    )

    # Deskew safely
    try:
        return deskew(thresh)
    except:
        return thresh


def deskew(image: np.ndarray) -> np.ndarray:
    coords = np.column_stack(np.where(image > 0))
    if coords.size == 0:
        return image

    angle = cv2.minAreaRect(coords)[-1]

    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle

    (h, w) = image.shape[:2]
    M = cv2.getRotationMatrix2D((w // 2, h // 2), angle, 1.0)

    return cv2.warpAffine(
        image, M, (w, h),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_REPLICATE
    )


# ----------------------------------------
# OCR
# ----------------------------------------
def extract_text(image_input, lang="eng"):
    processed = preprocess_image(image_input)
    pil_img = Image.fromarray(processed)
    return pytesseract.image_to_string(pil_img, lang=lang)


def extract_raw(image_input, lang="eng"):
    if isinstance(image_input, (str, Path)):
        return pytesseract.image_to_string(Image.open(image_input), lang=lang)
    return pytesseract.image_to_string(image_input, lang=lang)


# ----------------------------------------
# PDF OCR WRAPPER
# ----------------------------------------
def extract_text_from_pdf(pdf_path, lang="eng"):
    """
    Convert PDF to images, OCR each page, and combine to one string.
    """
    pages = pdf_to_images(pdf_path)
    full_text = []

    for i, page in enumerate(pages, start=1):
        print(f"OCRing page {i}/{len(pages)}...")
        page_text = extract_text(page, lang=lang)
        full_text.append(page_text)

    return "\n\n".join(full_text)


# ----------------------------------------
# DEBUG
# ----------------------------------------
if __name__ == "__main__":
    print(extract_text_from_pdf("samples/book_.pdf"))
