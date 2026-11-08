"""EasyBloc micro:bit — serveur local de FABRICATION des fiches d'aide (étape 10, nov. 2026).

Sert le dossier du logiciel (comme le serveur d'aperçu) et accepte en plus POST /_generer-aide, qui écrit une fiche
produite par outils/fiches/generer-fiches.js. Il n'écrit QUE dans le dossier aide/ (fichiers .html), et n'écoute que
sur l'ordinateur lui-même (127.0.0.1). Outil de fabrication : il n'est pas livré avec le logiciel.

Lancement (depuis Claude : configuration « easybloc_fiches » de .claude/launch.json) :
    python outils/fiches/serveur-fiches.py 8041
"""
import json
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ICI = os.path.dirname(os.path.abspath(__file__))
LOGICIEL = os.path.normpath(os.path.join(ICI, '..', '..'))
AIDE = os.path.join(LOGICIEL, 'aide')


class Gestionnaire(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=LOGICIEL, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def repondre(self, code, donnees):
        corps = json.dumps(donnees).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(corps)))
        self.end_headers()
        self.wfile.write(corps)

    def do_POST(self):
        if self.path != '/_generer-aide':
            self.repondre(404, {'ok': False, 'erreur': 'adresse inconnue'})
            return
        try:
            longueur = int(self.headers.get('Content-Length', '0'))
            demande = json.loads(self.rfile.read(longueur).decode('utf-8'))
            fichier = str(demande['fichier']).replace('\\', '/')
            cible = os.path.normpath(os.path.join(LOGICIEL, fichier))
            # Seulement dans aide/, seulement des pages .html
            if not cible.startswith(AIDE + os.sep) or not cible.endswith('.html'):
                raise ValueError('écriture refusée hors de aide/*.html : ' + fichier)
            os.makedirs(os.path.dirname(cible), exist_ok=True)
            with open(cible, 'w', encoding='utf-8', newline='\n') as f:
                f.write(demande['contenu'])
            self.repondre(200, {'ok': True, 'fichier': fichier})
        except Exception as erreur:  # noqa: BLE001 - message renvoye au generateur
            self.repondre(400, {'ok': False, 'erreur': str(erreur)})


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8041
    print('Serveur des fiches : http://127.0.0.1:%d/ (dossier %s)' % (port, LOGICIEL))
    ThreadingHTTPServer(('127.0.0.1', port), Gestionnaire).serve_forever()
