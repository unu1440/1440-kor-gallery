"""Local preview server: like `python -m http.server`, but tells the browser not to keep old copies,
so a change to templates.html (and the ?v= numbers inside it) shows up on the next page load.
Run from the project folder: python tools/serve.py [port]  (default 8440)"""
import http.server
import sys


class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8440
http.server.ThreadingHTTPServer(("", port), NoCache).serve_forever()
