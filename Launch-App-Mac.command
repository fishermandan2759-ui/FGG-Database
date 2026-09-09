#!/bin/bash
cd "$(dirname "$0")"

echo "================================================================"
echo "  Collier County Sheriff's Office - CODIS/FGG Database"
echo "================================================================"
echo ""

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed on this Mac."
    echo ""
    echo "To run this application locally from this folder:"
    echo "1. Download and install Node.js (free) from: https://nodejs.org"
    echo ""
    echo "OR open the live cloud version instantly without installing anything:"
    echo "https://ais-pre-hg2wcakfd4ib2cmj3nl546-443351119074.us-east5.run.app"
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "Initializing application and installing dependencies (one-time setup)..."
    npm install
fi

echo "Starting local server and opening your browser..."
(sleep 2 && open http://localhost:3000) &
npm run dev
