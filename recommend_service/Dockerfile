FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download PyThaiNLP dictionary ตอน build image
RUN python -c "from pythainlp.corpus import download; download('newmm-wordseg-20210101')"

COPY app/ ./app/

EXPOSE 8000

# ใช้ ${PORT:-8000} เพื่อรองรับ Railway ที่ inject PORT มาให้
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}