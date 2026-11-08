# -*- mode: python ; coding: utf-8 -*-
# Mode dossier ("onedir", nov. 2026) : dist/MicrobitEasybloc_V2.0E/ contient l'exe et _internal/. Un exe unique
# ("onefile") se decompresse dans un dossier temporaire a chaque lancement : Defender le classait comme dangereux et
# le supprimait de dist/. Distribuer le dossier entier (zip), jamais l'exe seul.


a = Analysis(
    ['app.py'],
    pathex=[],
    binaries=[],
    datas=[('index.html', '.'), ('multi.html', '.'), ('un.js', '.'), ('deux.js', '.'), ('trois.js', '.'), ('ia.js', '.'), ('ia-son-immediat.js', '.'), ('ia-immediat.js', '.'), ('tuto.js', '.'), ('bandeau.js', '.'), ('montage.js', '.'), ('modules-dessins.js', '.'), ('langue.js', '.'), ('langue-en.js', '.'), ('icones.js', '.'), ('aide', 'aide'), ('exercices.js', '.'), ('exercices.json', '.'), ('firmware.hex', '.'), ('logo.png', '.'), ('logo_ts.png', '.'), ('readme.txt', '.'), ('lib', 'lib')],
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='MicrobitEasybloc_V2.0E',
    version='version_info.txt',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=False,
    upx_exclude=[],
    name='MicrobitEasybloc_V2.0E',
)
