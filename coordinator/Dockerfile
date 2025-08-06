FROM python:3.11-slim
WORKDIR /app
COPY server.py .
RUN apt-get update && apt-get install -y git
RUN pip install "fastapi[all]" "uvicorn[standard]" aiohttp
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"] 