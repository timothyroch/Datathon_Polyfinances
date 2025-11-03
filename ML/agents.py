import io
import os
import tempfile
import boto3
from pathlib import Path
from typing import Optional
import trafilatura
from bs4 import BeautifulSoup
from lxml import etree


def extract_clean_text_from_s3(
    s3_key: str,
    bucket: str,
    aws_region: str = 'us-east-1'
) -> Optional[str]:
    """
    Extrait et nettoie le texte d'un fichier depuis S3.
    Enlève automatiquement les éléments inutiles.
    
    Args:
        s3_key: Chemin du fichier dans S3 (ex: 'directives/doc.html')
        bucket: Nom du bucket S3
        aws_region: Région AWS
    
    Returns:
        Texte nettoyé ou None si échec
    """
    
    try:
        print(f"   📥 Téléchargement depuis S3: s3://{bucket}/{s3_key}")
        
        s3_client = boto3.client('s3', region_name=aws_region)
        
        # Télécharger le fichier
        response = s3_client.get_object(Bucket=bucket, Key=s3_key)
        content = response['Body'].read()
        
        size_mb = len(content) / (1024 * 1024)
        print(f"   ✅ {size_mb:.2f} MB téléchargé")
        
        extension = Path(s3_key).suffix.lower()
        
        # ========== HTML ==========
        if extension in ['.html', '.htm']:
            print(f"   🧹 Nettoyage HTML...")
            html_str = content.decode('utf-8', errors='ignore')
            
            text = trafilatura.extract(
                html_str,
                include_comments=False,
                include_tables=True,
                no_fallback=False
            )
            
            if not text or len(text) < 100:
                print(f"   ⚠️  Fallback BeautifulSoup...")
                soup = BeautifulSoup(html_str, 'lxml')
                for tag in soup(['script', 'style', 'nav', 'header', 'footer', 'aside']):
                    tag.decompose()
                text = soup.get_text(separator='\n', strip=True)
            
            lines = [line.strip() for line in text.split('\n') if line.strip()]
            return '\n'.join(lines)
        
        # ========== XML ==========
        elif extension == '.xml':
            print(f"   🧹 Nettoyage XML...")
            
            if size_mb > 100:  # Streaming pour gros fichiers
                print(f"   ⚡ Mode streaming activé...")
                with tempfile.NamedTemporaryFile(delete=False, suffix='.xml') as tmp:
                    tmp.write(content)
                    tmp_path = tmp.name
                
                result = _stream_parse_xml(tmp_path)
                os.unlink(tmp_path)
                return result
            else:
                tree = etree.fromstring(content)
                
                for elem in tree.iter():
                    if elem.tag.startswith('{'):
                        elem.tag = elem.tag.split('}', 1)[1]
                
                text = ' '.join(tree.itertext())
                return ' '.join(text.split())
        
        # ========== PDF ==========
        elif extension == '.pdf':
            print(f"   📖 Extraction PDF...")
            import PyPDF2
            pdf_file = io.BytesIO(content)
            reader = PyPDF2.PdfReader(pdf_file)
            
            text = []
            for page in reader.pages:
                text.append(page.extract_text())
            return '\n'.join(text)
        
        # ========== DOCX ==========
        elif extension == '.docx':
            print(f"   📝 Extraction DOCX...")
            from docx import Document
            docx_file = io.BytesIO(content)
            doc = Document(docx_file)
            return '\n'.join([para.text for para in doc.paragraphs])
        
        # ========== Texte brut ==========
        else:
            print(f"   📝 Lecture texte brut...")
            return content.decode('utf-8', errors='ignore')
    
    except Exception as e:
        print(f"   ❌ Erreur S3: {str(e)}")
        return None


def _stream_parse_xml(file_path: str) -> str:
    """Parse XML en streaming pour économiser la mémoire."""
    texts = []
    
    context = etree.iterparse(
        file_path,
        events=('end',),
        tag=etree.Element
    )
    
    for event, elem in context:
        text = (elem.text or '').strip()
        if text and len(text) > 10:
            texts.append(text)
        
        elem.clear()
        while elem.getprevious() is not None:
            del elem.getparent()[0]
    
    return ' '.join(texts)


# ============================================
# EXEMPLES D'UTILISATION
# ============================================

if __name__ == "__main__":
    
    # Configuration
    BUCKET = "your-bucket-name"
    REGION = "us-east-1"
    
    # Exemple 1 : Un seul fichier
    text = extract_clean_text_from_s3(
        s3_key="directives/1.DIRECTIVE (UE) 20192161.html",
        bucket=BUCKET,
        aws_region=REGION
    )
    
    if text:
        print(f"\n✅ {len(text):,} caractères extraits")
        print(f"📄 Aperçu:\n{text[:300]}...\n")
    
    
    # Exemple 2 : Lister et traiter plusieurs fichiers
    s3_client = boto3.client('s3', region_name=REGION)
    response = s3_client.list_objects_v2(Bucket=BUCKET, Prefix='directives/')
    
    for obj in response.get('Contents', [])[:3]:  # 3 premiers
        s3_key = obj['Key']
        print(f"\n{'='*60}")
        print(f"📄 Processing: {s3_key}")
        print(f"{'='*60}\n")
        
        text = extract_clean_text_from_s3(s3_key, BUCKET, REGION)
        
        if text:
            print(f"✅ Extraction réussie: {len(text):,} chars\n")