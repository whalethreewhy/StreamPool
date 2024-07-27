from http.server import BaseHTTPRequestHandler, HTTPServer, ThreadingHTTPServer
from http.cookies import SimpleCookie
import mimetypes
import json
import time
from threading import Event
user_tokens = dict() #token: user id
connected_hosts = dict() #host id: [ip add,threading event, pin]
mimetypes.init()
class S(BaseHTTPRequestHandler):
    def __init__(self, request, client_address, server) -> None:
        super().__init__(request, client_address, server)
        

    def _set_response(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)

    def do_POST(self):
        #content_length = int(self.headers['Content-Length']) # <--- Gets the size of data
        #post_data = self.rfile.read(content_length) # <--- Gets the data itself
        #logging.info("POST request,\nPath: %s\nHeaders:\n%s\n\nBody:\n%s\n",
        #        str(self.path), str(self.headers), post_data.decode('utf-8'))
        print(self.path)
        
        if self.path == "/login":
            
            content_length = int(self.headers['Content-Length']) # <--- Gets the size of data
            post_data = self.rfile.read(content_length) # <--- Gets the data itself
            post_data = json.loads(post_data)
            try:
                token = str(hash(post_data['username']+post_data['password']))
                with open("users.json","rb") as f:
                    users = json.load(f)
                    if post_data["username"] in users:
                        if post_data["password"] == users[post_data["username"]]["password"]:
                            user_tokens[token] = users[post_data["username"]]["id"]
                            print(token)
                            cookie = SimpleCookie()
                            cookie['USER_TOKEN'] = token
                            cookie['userid'] = user_tokens[token]
                            cookie['username'] = post_data['username']
                            if users[post_data["username"]]['host']:
                                cookie['ishost'] = 1
                            else:
                                cookie['ishost'] = 0
                                cookie['ishost']['expires'] = 'Thu, 01 Jan 1970 00:00:00 GMT'

                            self.send_response(200)
                            for morsel in cookie.values():
                                self.send_header("Set-Cookie", morsel.OutputString())    
                            self.send_header('Content-type', 'text/plain')
                            self.end_headers()
                            self.wfile.write("/index.html".encode('utf-8'))
                            return
            except:
                pass
            self.send_response(200)
            self.end_headers()
        
        elif self.path == "/hostconnect":
            self.send_response(200)
            self.send_header('Content-type', 'text/plain')
            content_length = int(self.headers['Content-Length'])
            post_data = json.loads(self.rfile.read(content_length))
            
            hostid = post_data['hostid'] #implement checking against some token to prove host actually owns this id
            address = self.client_address[0]
            if 'address' in post_data:
                address = post_data['address']
            connected_hosts[hostid] = [address,Event(),None]

            self.send_header('Transfer-Encoding', 'chunked')
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            print("[HOST WAITING]",hostid,connected_hosts[hostid][0])
            connected_hosts[hostid][1].wait()
            self.wfile.write(f"{hex(len(connected_hosts[hostid][2]))[2:]}\r\n{connected_hosts[hostid][2]}\r\n0\r\n\r\n".encode('utf-8'))
            del connected_hosts[hostid]
        
        elif self.path == "/logout":
            cookies = SimpleCookie(self.headers.get('Cookie'))

            cookie = SimpleCookie()
            cookie['USER_TOKEN'] = ''
            cookie['USER_TOKEN']['expires'] = 'Thu, 01 Jan 1970 00:00:00 GMT' 
            cookie['userid'] = ''
            cookie['userid']['expires'] = 'Thu, 01 Jan 1970 00:00:00 GMT'
            cookie['username'] = ''
            cookie['username']['expires'] = 'Thu, 01 Jan 1970 00:00:00 GMT'
            cookie['ishost'] = ''
            cookie['ishost']['expires'] = 'Thu, 01 Jan 1970 00:00:00 GMT'
            self.send_response(200)
            for morsel in cookie.values():
                self.send_header("Set-Cookie", morsel.OutputString())
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write("logout".encode('utf-8'))
            if "USER_TOKEN" in cookies and cookies["USER_TOKEN"].value in user_tokens:
                user_tokens.pop(cookies["USER_TOKEN"].value)
            return

        cookies = SimpleCookie(self.headers.get('Cookie'))
        if "USER_TOKEN" in cookies and cookies["USER_TOKEN"].value in user_tokens:

            if self.path == "/listings":
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                with open("hostdata.json","rb") as f:
                    self.wfile.write(f.read())

            elif self.path == "/machines":
                self.send_response(200)
                try:
                    username = SimpleCookie(self.headers.get('Cookie'))["username"].value

                    with open("hostdata.json","rb") as f:
                        out = list(filter(lambda host: host['host'] == username,json.load(f)['hosts']))

                except:
                    out = []
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'machines':out}).encode('utf-8'))
            


            elif self.path == "/clientconnect":
                self.send_response(200)
                self.send_header('Content-type', 'text/plain')
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                hostid = post_data.decode('utf-8')
                print("[SENDINGIP]",hostid,connected_hosts[hostid][0])
                self.end_headers()
                self.wfile.write(connected_hosts[hostid][0].encode('utf-8'))
            
            elif self.path == "/sendpin":
                self.send_response(200)
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                post_data = json.loads(post_data)
                print("[SENDINGPIN]",post_data["hostid"])
                connected_hosts[post_data["hostid"]][2] = post_data["pin"]
                connected_hosts[post_data["hostid"]][1].set()
                self.end_headers()


    def do_GET(self):


        if self.path == "/login.html":
            self.send_response(200, 'OK')
            self.send_header('Content-type', 'text/html')

            self.end_headers()
            with open("./HTML/login.html","rb") as f:
                self.wfile.write(f.read())
            return
        
        cookies = SimpleCookie(self.headers.get('Cookie'))

        
        if self.path.startswith("/resource/") or ("USER_TOKEN" in cookies and cookies["USER_TOKEN"].value in user_tokens):

            
            if self.path == "/":
                self.send_response(200, 'OK')
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                with open("./HTML/index.html","rb") as f:
                    self.wfile.write(f.read())

            else:
                self.send_response(200, 'OK')
                try:
                    self.send_header('Content-type', mimetypes.types_map['.'+self.path.split(".")[-1]])
                except:
                    pass
                self.end_headers()
                
                try:
                    with open("./HTML"+self.path,"rb") as f:
                        self.wfile.write(f.read())
                except:
                    print("[ERROR]",self.path)
            
        else:
            self.send_response(301)
            print("[UNAUTHORIZED]",self.path)
            self.send_header('Location','/login.html')
            self.end_headers()

    def log_message(self, format: str, *args) -> None:
        pass
        return super().log_message(format, *args)

server_address = ('', 80)
httpd = ThreadingHTTPServer(server_address, S)
print('Starting httpd...\n')
try:
    httpd.serve_forever()
except KeyboardInterrupt:
    pass
httpd.server_close()