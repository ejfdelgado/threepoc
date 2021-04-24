
TODO

gcloud datastore indexes create index.yaml --project paistv
gcloud datastore indexes create index.yaml --project proyeccion-colombia1

Incluir permisos en la edición de la página.
Incluir la edición de la imágen de la página, que sea pública.
Desarrollar el atributo "q" que se autogenera a partir del titulo, la descripción de la página y los key words

Permitir hacer la edición de permisos de usuarios en tupla para página
Integrar el OCR con el upload.
Ingerar speech to text con el upload.



git clone https://github.com/code-kotis/qr-code-scanner
npm install
npm run start
npm run build

Lectura de estáticos
- Permitir generar llave que identifica la página de forma única, por usuario.
- Permitir guardar los datos de la página con el identificador único por usuario.
- Remplazo de html de el título, imágen, descripción, etc.
- Cache...

https://cloud.google.com/nodejs/docs/reference
https://github.com/GoogleCloudPlatform/nodejs-docs-samples

export GOOGLE_APPLICATION_CREDENTIALS='/Users/jose.delgado/desarrollo/threepoc/llaves/proyeccion-colombia1-b492ce8a0bae.json'

export GOOGLE_APPLICATION_CREDENTIALS='/Users/jose.delgado/desarrollo/threepoc/llaves/paistv-5087a82b438a.json'

export GAE_APPLICATION="paistv"

export GAE_APPLICATION="proyeccion-colombia1"

Para compilar:
gulp js

Para correr el servidor:
npm run start

source /Users/jose.delgado/.bash_profile_gcp

gcloud app deploy app.yaml --project paistv --version 2

gcloud app deploy app.yaml --project proyeccion-colombia1 --version 2

gcloud app deploy app.yaml --project ejfexperiments --version 2

https://medium.com/google-cloud/app-engine-project-cleanup-9647296e796a

------------------------------------------------------------------------------------------------------------------------>>

open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security


sudo lsof -i tcp:80
sudo kill -9 <PID>


gsutil -m cp -R gs://proyeccion-colombia1.appspot.com .

chrome://flags/#unsafely-treat-insecure-origin-as-secure

/Users/jose.delgado/.bashrc

sudo export GOOGLE_APPLICATION_CREDENTIALS="/Users/jose.delgado/sdks/credenciales/paistv-a16726bda177.json"

brew install pyenv
pyenv install 2.7.18
pyenv install 3.7.0
pyenv versions
pyenv init -
pyenv local 3.7.0
pyenv local 2.7.18
python -V

Instancia mysql
viy6w085Jbi7O9bm

paistv:southamerica-east1:mysqlbase

https://medium.com/flawless-app-stories/gyp-no-xcode-or-clt-version-detected-macos-catalina-anansewaa-38b536389e8d
xcode-select --print-path
sudo xcode-select --reset
/Library/Developer/CommandLineTools
sudo rm -r -f /Library/Developer/CommandLineTools
xcode-select --install
npm install

/d/workspaceGAE/paistv
D:\workspaceGAE\paistv

En la carpeta del proyecto:
pip37 install -r requirements.txt

En una carpeta aparte:

>python37 -m pip install virtualenv
>python37 -m pip install --upgrade pip
>pip37 list

pip37 install requests

sudo --preserve-env python main.py
python37 main.py


gcloud auth login
gcloud config set project paistv
gcloud app regions list
gcloud app create --region southamerica-east1
gcloud app deploy

gcloud app deploy index.yaml

gcloud app deploy app.yaml --project paistv --version 1

gcloud app deploy app.yaml --project pmoney-212819 --version 1

gcloud components update

>virtualenv37 env
env\Scripts\activate

https://console.cloud.google.com/iam-admin/serviceaccounts?project=paistv

https://github.com/googleapis/google-cloud-python
https://github.com/googleapis/google-api-python-client

https://flask.palletsprojects.com/en/1.1.x/
https://cloud.google.com/appengine/docs/standard/python3/runtime
https://cloud.google.com/appengine/docs/standard/python3/building-app
https://www.python.org/ftp/python/3.7.7/python-3.7.7-amd64.exe
https://github.com/PowerShell/PowerShell/releases/tag/v7.1.0-preview.1
https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell-core-on-windows?view=powershell-6#prerequisites


npm install gulp --save-dev
npm install gulp-babel --save-dev
npm install gulp-cli --save-dev
npm install gulp-coffee --save-dev
npm install gulp-concat --save-dev
npm install gulp-connect --save-dev
npm install gulp-copy --save-dev
npm install gulp-minify-css --save-dev
npm install gulp-sass --save-dev
npm install gulp-sequence --save-dev
npm install gulp-uglify --save-dev
npm install gulp-util --save-dev
npm install gulp-zip --save-dev
npm install --save-dev babel-core babel-preset-env
npm install --save-dev @babel/core @babel/preset-env

gulp jslibs

gulp libs --pretty no
gulp js --pretty no --app "mylibs"
gulp js --pretty no --app "1/shake/"
gulp js --pretty no --app "1/sql/"

code /etc/hosts
sudo vi /etc/pf.anchors/tv.pais
sudo vi /etc/pf.conf
sudo pfctl -ef /etc/pf.conf

gsutil cors get gs://paistv.appspot.com
gsutil cors set cors.json gs://paistv.appspot.com

VNC TIGER
gcloud beta compute ssh --zone "us-central1-b" "escannertresd-b" --project "paistv"
vncserver -localhost no
vncserver -kill :*
sudo passwd edgar_jose_fernando_delgado

.bashrc
# ----------------------
# Python Aliases
# ----------------------
alias python37='/d/Python37/python.exe'
alias pip37='/d/Python37/Scripts/pip.exe'
alias virtualenv37='/d/Python37/Scripts/virtualenv.exe'

export GOOGLE_APPLICATION_CREDENTIALS='/e/Google/paistv-a2eded18d8a1.json'

export GAE_APPLICATION='paistv'
export PATH='/c/Users/Edgar/bin:/mingw64/bin:/usr/local/bin:/usr/bin:/bin:/mingw64/bin:/usr/bin:/c/Users/Edgar/bin:/c/Windows/system32:/c/Windows:/c/Windows/System32/Wbem:/c/Windows/System32/WindowsPowerShell/v1.0:/d/osm-bundler/osm-bundlerWin32:/e/Python27:/e/Python27/Scripts:/c/Users/Edgar/AppData/Roaming/npm:/e/Program Files/Microsoft VS Code/bin:/e/Program Files (x86)/Sophos/Sophos SSL VPN Client/bin:/usr/bin/vendor_perl:/usr/bin/core_perl:/e/Google/Cloud SDK/google-cloud-sdk/bin:/d/Program Files (x86)/nodejs'
# ----------------------

Hubo conflictos en npm:
    "webrtc-adapter": "^7.6.3"
    "webrtc-adapter": "^1.1.0"

Si ocurre el siguiente error:
npm ERR! code EISGIT
Usar:
rm -rf node_modules/*/.git/


ssh-keygen -t rsa -C "edgar.jose.fernando.delgado@gmail.com" -f "id_rsa_personal"
ssh-add ~/.ssh/id_rsa_personal
vi .ssh/config

Host *github.com
  AddKeysToAgent yes
  UseKeychain yes
  IdentityFile ~/.ssh/id_rsa_personal

Host *github.com
  AddKeysToAgent yes
  UseKeychain yes
  IdentityFile ~/.ssh/id_rsa_githubweb


  -------
        fetch(urlDelete, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        })
          .then((res2) => res2.json())
          .then((json2) => {
            console.log(json2);
          });

 ----------

 Bug en emojionearea data-name="{name}"/></i>
npm install emojionearea@^2.1.0 --save
https://mervick.github.io/emojionearea/