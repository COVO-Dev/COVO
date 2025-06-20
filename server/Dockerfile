FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY matching ./matching

CMD ["uvicorn", "matching.main:app", "--host", "0.0.0.0", "--port", "8000"]
