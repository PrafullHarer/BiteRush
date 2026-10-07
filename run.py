#!/usr/bin/env python3
"""
=============================================================================
 Project Runner & Orchestrator (Python)
 Launches the JavaScript Backend, SQL Database, and Frontend Application.
=============================================================================
"""

import os
import sys
import subprocess
import webbrowser
import time
import signal
import shutil

SERVER_PORT = 3000
SERVER_URL = f"http://localhost:{SERVER_PORT}"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ANSI Colors for terminal output
CYAN = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BOLD = "\033[1m"
RESET = "\033[0m"


def print_banner():
    print(f"{CYAN}{BOLD}")
    print("=" * 60)
    print("  🚀 FULL-STACK AUTHENTICATION PORTAL RUNNER")
    print("  Backend: Node.js / JavaScript | Frontend: HTML / CSS")
    print("  Database: SQLite (SQL)        | Runner: Python 3")
    print("=" * 60)
    print(f"{RESET}")
    print(f"{CYAN}  📦 BiteRush Food Delivery Platform{RESET}")
    print()


def check_prerequisites():
    """Verify that Node.js and npm are installed."""
    print(f"[*] Checking prerequisites...")

    node_path = shutil.which("node")
    npm_path = shutil.which("npm")

    if not node_path:
        print(f"{RED}[-] Error: 'node' was not found in your PATH.{RESET}")
        print("Please install Node.js from https://nodejs.org/ and try again.")
        sys.exit(1)

    if not npm_path:
        print(f"{RED}[-] Error: 'npm' was not found in your PATH.{RESET}")
        sys.exit(1)

    print(f"{GREEN}[✓] Node.js and npm detected successfully.{RESET}")


def install_dependencies_if_needed():
    """Check if node_modules exists, otherwise install dependencies."""
    node_modules_path = os.path.join(BASE_DIR, "node_modules")

    if not os.path.exists(node_modules_path):
        print(f"\n{YELLOW}[!] 'node_modules' not found. Installing dependencies via npm...{RESET}")
        try:
            # Use shell=True for cross-platform compatibility (especially on Windows)
            subprocess.check_call("npm install", cwd=BASE_DIR, shell=True)
            print(f"{GREEN}[✓] Dependencies installed successfully!{RESET}\n")
        except subprocess.CalledProcessError as e:
            print(f"{RED}[-] Failed to install npm dependencies: {e}{RESET}")
            sys.exit(1)
    else:
        print(f"{GREEN}[✓] Dependencies already installed.{RESET}")


def run_server():
    """Run the Node.js server and open the browser."""
    print(f"\n{CYAN}[*] Starting Backend Server (server.js)...{RESET}")

    # Launch server process
    server_process = subprocess.Popen(
        ["node", "server.js"],
        cwd=BASE_DIR,
        shell=(os.name == "nt")  # Windows support
    )

    def shutdown(signum=None, frame=None):
        print(f"\n{YELLOW}[*] Shutting down application gracefully...{RESET}")
        try:
            if os.name == "nt":
                # On Windows, kill process tree
                subprocess.call(['taskkill', '/F', '/T', '/PID', str(server_process.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            else:
                server_process.terminate()
                server_process.wait(timeout=3)
        except Exception:
            server_process.kill()
        print(f"{GREEN}[✓] Stopped. Goodbye!{RESET}")
        sys.exit(0)

    # Register signal handlers for clean exit
    signal.signal(signal.SIGINT, shutdown)
    if hasattr(signal, "SIGTERM"):
        signal.signal(signal.SIGTERM, shutdown)

    # Wait a moment for server initialization, then open browser
    time.sleep(1.5)
    print(f"{GREEN}[✓] Server running at: {BOLD}{SERVER_URL}{RESET}")
    print(f"{CYAN}[*] Opening web browser...{RESET}")
    try:
        webbrowser.open(SERVER_URL)
    except Exception as e:
        print(f"{YELLOW}[!] Could not automatically open browser: {e}{RESET}")
        print(f"Please open: {SERVER_URL}")

    print(f"\n{BOLD}Press Ctrl+C in this terminal to stop the server.{RESET}\n")

    try:
        server_process.wait()
    except KeyboardInterrupt:
        shutdown()


def main():
    print_banner()
    check_prerequisites()
    install_dependencies_if_needed()
    run_server()


if __name__ == "__main__":
    main()
