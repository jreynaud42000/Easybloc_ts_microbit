"""Serveur local du projet micro:bit.

Sert le dossier de l'application sur http://localhost:8000 et l'ouvre dans une
seule fenetre (Edge en mode application, sinon le navigateur). Fonctionne aussi bien lance directement (`python app.py`, avec sa
fenetre console) qu'empaquete par PyInstaller en .exe SANS fenetre console :
dans ce cas le serveur tourne cache et s'arrete tout seul quand la derniere
page de l'application est fermee (voir "Cycle de vie" plus bas).
"""

import http.server
import json
import os
import socketserver
import sys
import threading
import time
import urllib.parse
import urllib.request
import webbrowser

PORT = 8000
# Numero de version : a tenir identique dans version_info.txt (proprietes de
# l'exe), app.spec (nom du fichier) et le texte de #copyright-toolbar (index.html).
VERSION = "V2.0E"
NOM_APPLICATION = "MicrobitEasybloc"
TITRE_BOITE = "Programmation Micro:bit V2"

# Vrai pour l'exe PyInstaller (sans console) ; faux pour `python app.py`.
EXE = getattr(sys, "frozen", False)

# Cycle de vie de l'exe (en secondes ; surchargeables par variables
# d'environnement, uniquement pour tester sans attendre) :
#  - SILENCE : une page qui n'a pas donne signe de vie depuis ce delai est
#    consideree fermee (navigateur plante). 150 s > 60 s, car un onglet cache
#    peut voir ses minuteries ralenties a une par minute.
#  - GRACE : delai laisse apres la fermeture de la derniere page avant de
#    s'arreter. Un rechargement (F5) ferme puis rouvre une page en moins de
#    ce delai : le serveur ne doit pas s'arreter au milieu.
#  - DEMARRAGE : si aucune page ne se connecte du tout (navigateur bloque),
#    le serveur invisible ne doit pas rester indefiniment.
DELAI_SILENCE = float(os.environ.get("MICROBIT_DELAI_SILENCE", 150))
DELAI_GRACE = float(os.environ.get("MICROBIT_DELAI_GRACE", 5))
DELAI_DEMARRAGE = float(os.environ.get("MICROBIT_DELAI_DEMARRAGE", 90))

# Pages actuellement ouvertes : identifiant -> instant du dernier signe de vie.
_pages = {}
_verrou = threading.Lock()
# vu : une page s'est deja connectee au moins une fois ; dernier : instant du
# dernier signe de vie ou de la derniere fermeture (le delai de grace se compte
# depuis lui, pas depuis un vieux moment ou le serveur etait deja sans page).
_etat = {"vu": False, "dernier": 0.0}


def dossier_de_lapplication():
    """Le dossier contenant index.html, les .js de la page, firmware.hex et lib/.

    Empaquete par PyInstaller (mode dossier), les fichiers sont dans _internal/, que designe sys._MEIPASS ;
    sinon ils sont a cote de ce script. Dans les deux cas il faut s'y placer,
    faute de quoi le serveur sert le repertoire courant de l'appelant.
    """
    if EXE:
        return sys._MEIPASS
    return os.path.dirname(os.path.abspath(__file__))


def alerte(message):
    """Message d'erreur visible : boite de dialogue en exe (pas de console), texte sinon."""
    if EXE and os.name == "nt":
        try:
            import ctypes
            ctypes.windll.user32.MessageBoxW(0, message, TITRE_BOITE, 0x10)  # 0x10 : icone d'erreur
            return
        except Exception:
            pass
    print(message)


def trouver_edge():
    """Chemin de msedge.exe, ou None (Edge absent, ou autre systeme que Windows)."""
    if os.name != "nt":
        return None
    for variable in ("ProgramFiles(x86)", "ProgramFiles", "LOCALAPPDATA"):
        racine = os.environ.get(variable)
        if racine:
            chemin = os.path.join(racine, "Microsoft", "Edge", "Application", "msedge.exe")
            if os.path.isfile(chemin):
                return chemin
    return None


def ouvrir_fenetre(url):
    """Ouvre l'application dans UNE seule fenetre, sans onglets ni barre d'adresse.

    Edge en mode application (--app) : fenetre a part, meme profil que le
    navigateur habituel, donc memes donnees enregistrees (localStorage) qu'avant
    pour http://localhost:8000. Le port serie (envoi sur la carte) et la camera
    y marchent comme dans un onglet. Sans Edge, ou s'il refuse de demarrer, on
    revient a l'ancien comportement : un onglet du navigateur par defaut.
    """
    edge = trouver_edge()
    if edge:
        try:
            import subprocess
            subprocess.Popen([edge, "--app=" + url, "--start-maximized"],
                             stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            return
        except OSError:
            pass
    webbrowser.open(url)


def signe_de_vie(identifiant):
    with _verrou:
        _pages[identifiant] = time.time()
        _etat["vu"] = True
        _etat["dernier"] = _pages[identifiant]


def page_fermee(identifiant):
    with _verrou:
        _pages.pop(identifiant, None)
        _etat["dernier"] = time.time()


class Serveur(socketserver.ThreadingMixIn, socketserver.TCPServer):
    # Sans cela, un redemarrage rapide echoue sur "Address already in use"
    # tant que le systeme n'a pas libere le port. PAS sous Windows : la, cette
    # option laisse DEUX serveurs ecouter le meme port en meme temps (les
    # requetes se repartissent entre eux, l'un servant parfois un autre
    # dossier) et la detection de port occupe ci-dessous ne se declenche
    # jamais. Windows rebinde de toute facon un port en TIME_WAIT sans elle.
    allow_reuse_address = os.name != "nt"
    daemon_threads = True


class Handler(http.server.SimpleHTTPRequestHandler):
    """Sert les fichiers en interdisant leur mise en cache.

    python -m http.server n'envoie aucun en-tete Cache-Control : le navigateur
    applique alors sa propre heuristique et ressert un ancien index.html ou
    un.js apres modification. On croit tester la nouvelle version alors qu'on
    regarde l'ancienne. Ces trois en-tetes suppriment le probleme.

    Trois adresses internes (commencant par _) servent au cycle de vie :
      /_vie?id=X     la page X est ouverte (appelee toutes les 5 s)
      /_ferme?id=X   la page X se ferme (envoyee par le navigateur en quittant)
      /_app          identifie cette application (pour ne pas lancer deux exe)
    """

    # MediaPipe (lib/mediapipe) est un module JavaScript en .mjs, plus un .wasm.
    # Python 3.8 sous Windows annonce le .mjs en text/plain : le navigateur
    # refuse alors de l'importer comme module. On fixe les deux types.
    # Police Inter (lib/polices) : .woff2, inconnu de certaines versions de Python.
    extensions_map = dict(http.server.SimpleHTTPRequestHandler.extensions_map,
                          **{".mjs": "text/javascript", ".wasm": "application/wasm", ".woff2": "font/woff2"})

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def _reponse_vide(self):
        self.send_response(204)
        self.end_headers()

    def _traiter_interne(self):
        """Renvoie True si la requete etait une adresse interne (deja traitee)."""
        analyse = urllib.parse.urlparse(self.path)
        identifiant = urllib.parse.parse_qs(analyse.query).get("id", ["?"])[0]
        if analyse.path == "/_vie":
            signe_de_vie(identifiant)
            self._reponse_vide()
            return True
        if analyse.path == "/_ferme":
            page_fermee(identifiant)
            self._reponse_vide()
            return True
        if analyse.path == "/_app":
            corps = json.dumps({"app": NOM_APPLICATION, "version": VERSION}).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(corps)))
            self.end_headers()
            self.wfile.write(corps)
            return True
        return False

    def do_GET(self):
        if not self._traiter_interne():
            super().do_GET()

    def do_POST(self):
        # navigator.sendBeacon envoie un POST.
        if not self._traiter_interne():
            self.send_error(405)

    def log_message(self, format, *args):
        # Sans console (exe), sys.stderr peut etre inutilisable : on se tait.
        if not EXE:
            super().log_message(format, *args)


def instance_existante(port):
    """Vrai si une autre copie de CETTE application repond deja sur ce port."""
    try:
        with urllib.request.urlopen("http://127.0.0.1:%d/_app" % port, timeout=1) as reponse:
            return json.load(reponse).get("app") == NOM_APPLICATION
    except Exception:
        return False


def surveiller(httpd):
    """Arrete le serveur quand plus aucune page n'est ouverte (exe uniquement)."""
    debut = time.time()
    vide_depuis = None
    while True:
        time.sleep(1)
        maintenant = time.time()
        with _verrou:
            for identifiant, vu_le in list(_pages.items()):
                if maintenant - vu_le > DELAI_SILENCE:
                    del _pages[identifiant]
            vide = not _pages
            deja_vu = _etat["vu"]
            dernier = _etat["dernier"]
        if not vide:
            vide_depuis = None
            continue
        if vide_depuis is None:
            vide_depuis = maintenant if deja_vu else debut
        # Une fermeture ou un signe tout recent repousse l'echeance (rechargement de page).
        reference = max(vide_depuis, dernier) if deja_vu else vide_depuis
        if maintenant - reference > (DELAI_GRACE if deja_vu else DELAI_DEMARRAGE):
            httpd.shutdown()
            return


if __name__ == "__main__":
    # Sans console (exe), sys.stdout et sys.stderr valent None : print() et le
    # journal HTTP planteraient. On les envoie dans le vide.
    if sys.stdout is None:
        sys.stdout = open(os.devnull, "w", encoding="utf-8")
    if sys.stderr is None:
        sys.stderr = open(os.devnull, "w", encoding="utf-8")

    os.chdir(dossier_de_lapplication())
    print("Programmation Micro:bit V2 - version %s" % VERSION)
    print("Dossier servi :", os.getcwd())

    # Port 8000 de preference ; s'il est pris on essaie les neuf suivants plutot
    # que de s'arreter. Mais si le port est pris par une autre copie de CETTE
    # application (exe deja lance, donc invisible), on se contente de rouvrir une
    # fenetre dessus : un second double-clic ne doit pas empiler des serveurs
    # caches.
    httpd = None
    for port in range(PORT, PORT + 10):
        try:
            httpd = Serveur(("", port), Handler)
            break
        except OSError as erreur:
            print("Port %d indisponible : %s" % (port, erreur))
            if EXE and instance_existante(port):
                ouvrir_fenetre("http://localhost:%d" % port)
                sys.exit(0)
    if httpd is None:
        alerte("Aucun port libre entre %d et %d.\nFermez les autres serveurs puis relancez l'application." % (PORT, PORT + 9))
        sys.exit(1)
    PORT = port

    # La fenetre est ouverte apres que le serveur ecoute, sinon elle arrive
    # parfois trop tot et affiche une page d'erreur.
    threading.Timer(0.5, ouvrir_fenetre, ["http://localhost:%d" % PORT]).start()

    print("Application disponible sur http://localhost:%d" % PORT)
    if EXE:
        threading.Thread(target=surveiller, args=(httpd,), daemon=True).start()
    else:
        print("Fermez cette fenetre pour arreter le serveur.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nArret du serveur.")
    finally:
        httpd.server_close()
