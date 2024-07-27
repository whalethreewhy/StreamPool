import subprocess
import json
from pathlib import Path
import os
import requests

import ctypes, sys

def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False

if is_admin():
    with open("hostsettings.json","rb") as f:
        settings = json.load(f)

    os.chdir(Path(settings["sunshinepath"]).parent.absolute())
    subprocess.Popen(settings["sunshinepath"])

    pin = ""
    with requests.Session() as s:
        print("[WAITING FOR PIN]")
        hostdata = {'hostid': settings['hostid']}
        if settings['addressoverride']:
            hostdata['address'] = settings['addressoverride']
        with s.post(settings['remoteserveraddress']+'/hostconnect',json=hostdata,stream=True) as resp:
            for line in resp.raw.read_chunked():
                pin = line.decode("utf-8")

    with requests.Session() as s:
        response = s.post(f'https://localhost:{settings["sunshineport"]}/api/pin',auth = requests.auth.HTTPBasicAuth('admin', 'password'),verify=False,json={'pin': pin})
        print(response.text)
    while True:
        input()
else:
    ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, " ".join(sys.argv), None, 1)



