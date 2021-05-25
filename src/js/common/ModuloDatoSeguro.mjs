
	// ¿Cómo generar las llaves públicas y privadas?
	
	//1. Se genera el par:
	//openssl genrsa -out local_par.pem 2048
	
	//2. Se genera la llave pública:
	//openssl rsa -in local_par.pem -pubout -out local_publica.crt
	
	//3. Se genera la llave privada:
	//openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in local_par.pem -out local_privada.key
	
	//openssl genrsa -out local_par.pem 256 && openssl rsa -in local_par.pem -pubout -out local_publica.crt && openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in local_par.pem -out local_privada.key

export class ModuloDatoSeguro {
  // create a key for symmetric encryption
  // pass in the desired length of your key
  static generateKey = function (keyLength) {
    // define the characters to pick from
    var chars =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz*&-%/!?*+=()";
    var randomstring = "";
    for (var i = 0; i < keyLength; i++) {
      var rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
  };

  static cifrar = function (objeto, llavePublica) {
    var key = ModuloDatoSeguro.generateKey(10);
    var texto = JSON.stringify(objeto); //JSON
    var aesEncrypted = CryptoJS.AES.encrypt(texto, key);
    var encryptedMessage = aesEncrypted.toString();
    // we create a new JSEncrypt object for rsa encryption
    var rsaEncrypt = new JSEncrypt();
    // we set the public key (which we passed into the function)
    rsaEncrypt.setPublicKey(llavePublica);
    // now we encrypt the key & iv with our public key
    var encryptedKey = rsaEncrypt.encrypt(key);
    //Se codifica en base 64 para que pueda viajar en la url
    return btoa(
      JSON.stringify({
        llave: encryptedKey,
        mensaje: encryptedMessage,
      })
    );
  };

  static decifrar = function (texto, llavePrivada) {
    var decrypt = new JSEncrypt();
    decrypt.setPrivateKey(llavePrivada);
    var parametroSinBase64 = JSON.parse(atob(texto));
    var llaveDesencriptada = decrypt.decrypt(parametroSinBase64["llave"]);
    var desencriptado = CryptoJS.AES.decrypt(
      parametroSinBase64["mensaje"],
      llaveDesencriptada
    ).toString(CryptoJS.enc.Utf8);
    return JSON.parse(desencriptado);
  };

	//Otra manera de hacerlo más sencillo.
  //https://stackoverflow.com/questions/12524994/encrypt-decrypt-using-pycrypto-aes-256
  /*
	var clave = moduloDatoSeguro.generateKey(4);
	var encriptado = CryptoJS.AES.encrypt(dato, clave);
	var desencriptado = CryptoJS.AES.decrypt(encriptado, clave).toString(CryptoJS.enc.Utf8);
  alert(encriptado+'='+desencriptado);
  */
}
