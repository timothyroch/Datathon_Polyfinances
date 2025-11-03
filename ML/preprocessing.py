import os
from pathlib import Path
from typing import Optional, Union, Dict
import json
import boto3



def extract_text_from_any_file(file_path: Union[str, Path]) -> Optional[str]:
    """
    Extrait le texte de différents types de fichiers.
    
    Args:
        file_path: Chemin vers le fichier
        
    Returns:
        Texte extrait ou None si échec
    """
    file_path = Path(file_path)
    
    if not file_path.exists():
        print(f"Erreur: Le fichier {file_path} n'existe pas")
        return None
    
    extension = file_path.suffix.lower()
    
    try:
        # Fichiers texte simples
        if extension in ['.txt', '.md', '.log', '.csv', '.json', '.xml', '.html', '.py', '.js', '.java', '.cpp']:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
        
        # PDF
        elif extension == '.pdf':
            import PyPDF2
            text = []
            with open(file_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    text.append(page.extract_text())
            return '\n'.join(text)
        
        # Word (.docx)
        elif extension == '.docx':
            from docx import Document
            doc = Document(str(file_path))
            return '\n'.join([para.text for para in doc.paragraphs])
        
        # Excel
        elif extension in ['.xlsx', '.xls']:
            import pandas as pd
            df = pd.read_excel(file_path, sheet_name=None)
            text = []
            for sheet_name, sheet_df in df.items():
                text.append(f"=== Sheet: {sheet_name} ===")
                text.append(sheet_df.to_string())
            return '\n\n'.join(text)
        
        # HTML
        elif extension in ['.html', '.htm']:
            from bs4 import BeautifulSoup
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                soup = BeautifulSoup(f.read(), 'html.parser')
                return soup.get_text(separator='\n', strip=True)
        
        # Image (OCR avec pytesseract)
        elif extension in ['.png', '.jpg', '.jpeg', '.tiff', '.bmp']:
            from PIL import Image
            import pytesseract
            image = Image.open(file_path)
            return pytesseract.image_to_string(image)
        
        # Autres formats texte
        else:
            print(f"Avertissement: Type de fichier {extension} non spécifiquement supporté, tentative de lecture en texte brut")
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
                
    except Exception as e:
        print(f"Erreur lors de l'extraction du texte de {file_path}: {str(e)}")
        return None
    

def detect_language(text: str) -> str:
    """
    Détecte la langue d'un texte.
    
    Args:
        text: Texte à analyser
        
    Returns:
        Code de langue (ex: 'en', 'fr', 'es') ou message d'erreur
    """
    if not text or len(text.strip()) < 10:
        return "Erreur: Texte trop court ou vide"
    
    try:
        from langdetect import detect
        return detect(text)
    except ImportError:
        return "Erreur: La bibliothèque langdetect n'est pas installée"
    except Exception as e:
        return f"Erreur detection de langue : {str(e)}"
    

def translate_and_structure_bedrock(text: str, source_lang: str) -> str:
    """Traduit + structure en Markdown avec Bedrock (1 appel optimisé)."""
    
    client = boto3.client('bedrock-runtime', region_name='us-east-1')
    
    if source_lang == 'en':
        # Si déjà anglais, juste structurer
        prompt = f"""Structure this English regulatory document into clean Markdown.

Rules: Clear headings (# ## ###), lists, preserve all data, remove formatting artifacts.

Document:
{text[:400000]}

Return ONLY Markdown:"""
    
    else:
        # Traduction en anglais + structuration
        prompt = f"""Translate this document to English AND structure it as Markdown.

Rules:
- Accurate translation to English (preserve dates, numbers, names)
- Clean Markdown structure (# ## ###, lists)
- Full content, no summary
- Remove formatting artifacts

Document:
{text[:400000]}

Return ONLY English Markdown:"""
    
    response = client.invoke_model(
        modelId='anthropic.claude-3-haiku-20240307-v1:0',
        body=json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 100000,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.1
        })
    )
    
    result = json.loads(response['body'].read())
    return result['content'][0]['text']


def preprocess_document_to_markdown(
    file_path: Union[str, Path],
    output_dir: Union[str, Path] = "processed_docs"
) -> Optional[Path]:
    """Pipeline complet 100% Bedrock."""
    file_path = Path(file_path)
    output_dir = Path(output_dir)
    output_dir.mkdir(exist_ok=True)
    
    print(f"\n{'='*60}\n📄 {file_path.name}\n{'='*60}\n")
    
    # Extraction
    print("1️⃣ Extracting...")
    text = extract_text_from_any_file(file_path)
    if not text:
        return None
    
    # Détection langue
    print("2️⃣ Detecting language...")
    lang = detect_language(text)
    print(f"   → {lang}\n")
    
    # Traduction + Structuration
    print("3️⃣ Processing with Bedrock...")
    markdown = translate_and_structure_bedrock(text, lang)
    
    # Sauvegarde
    output_file = output_dir / f"{file_path.stem}.md"
    output_file.write_text(markdown, encoding='utf-8')
    
    print(f"✅ {output_file}\n")
    return output_file




# Exemple d'utilisation
if __name__ == "__main__":
    # Test avec un fichier
    file_path = r"Data Justin\directives\1.DIRECTIVE (UE) 20192161 DU PARLEMENT EUROPÉEN ET DU CONSEIL.html"
  
    preprocess_document_to_markdown(file_path)