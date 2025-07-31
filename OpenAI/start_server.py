#!/usr/bin/env python3
"""Start the recommendation service"""

import subprocess
import sys
import os

# Change to the OpenAI directory
os.chdir('/Users/muhammedrefaat/covo-dev/COVO/OpenAI')

# Start the FastAPI server
try:
    print("Starting FastAPI server...")
    result = subprocess.run([sys.executable, 'main.py'], capture_output=True, text=True)
    print(f"Exit code: {result.returncode}")
    print(f"STDOUT: {result.stdout}")
    print(f"STDERR: {result.stderr}")
except Exception as e:
    print(f"Error starting server: {e}")
