export const EXTENSION_MAP = {
  abs: "audio/x-mpeg",
  ai: "application/postscript",
  aif: "audio/x-aiff",
  aifc: "audio/x-aiff",
  aiff: "audio/x-aiff",
  aim: "application/x-aim",
  art: "image/x-jg",
  asf: "video/x-ms-asf",
  asx: "video/x-ms-asf",
  au: "audio/basic",
  avi: "video/x-msvideo",
  avx: "video/x-rad-screenplay",
  bcpio: "application/x-bcpio",
  bin: "application/octet-stream",
  bmp: "image/bmp",
  body: "text/html",
  cdf: "application/x-cdf",
  cer: "application/x-x509-ca-cert",
  class: "application/java",
  cpio: "application/x-cpio",
  csh: "application/x-csh",
  css: "text/css",
  dib: "image/bmp",
  doc: "application/msword",
  dtd: "text/plain",
  dv: "video/x-dv",
  dvi: "application/x-dvi",
  eps: "application/postscript",
  etx: "text/x-setext",
  exe: "application/octet-stream",
  gif: "image/gif",
  gtar: "application/x-gtar",
  gz: "application/x-gzip",
  hdf: "application/x-hdf",
  hqx: "application/mac-binhex40",
  htc: "text/x-component",
  htm: "text/html",
  html: "text/html",
  ief: "image/ief",
  jad: "text/vnd.sun.j2me.app-descriptor",
  jar: "application/octet-stream",
  java: "text/plain",
  jnlp: "application/x-java-jnlp-file",
  jpe: "image/jpeg",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "text/javascript",
  kar: "audio/x-midi",
  latex: "application/x-latex",
  m3u: "audio/x-mpegurl",
  mac: "image/x-macpaint",
  man: "application/x-troff-man",
  me: "application/x-troff-me",
  mid: "audio/x-midi",
  midi: "audio/x-midi",
  mif: "application/x-mif",
  mjs: "text/javascript",
  mov: "video/quicktime",
  movie: "video/x-sgi-movie",
  mp1: "audio/x-mpeg",
  mp2: "audio/x-mpeg",
  mp3: "audio/x-mpeg",
  mpa: "audio/x-mpeg",
  mpe: "video/mpeg",
  mpeg: "video/mpeg",
  mpega: "audio/x-mpeg",
  mpg: "video/mpeg",
  mpv2: "video/mpeg2",
  ms: "application/x-wais-source",
  nc: "application/x-netcdf",
  oda: "application/oda",
  pbm: "image/x-portable-bitmap",
  pct: "image/pict",
  pdf: "application/pdf",
  pgm: "image/x-portable-graymap",
  pic: "image/pict",
  pict: "image/pict",
  pls: "audio/x-scpls",
  png: "image/png",
  pnm: "image/x-portable-anymap",
  pnt: "image/x-macpaint",
  ppm: "image/x-portable-pixmap",
  ps: "application/postscript",
  psd: "image/x-photoshop",
  qt: "video/quicktime",
  qti: "image/x-quicktime",
  qtif: "image/x-quicktime",
  ras: "image/x-cmu-raster",
  rgb: "image/x-rgb",
  rm: "application/vnd.rn-realmedia",
  roff: "application/x-troff",
  rtf: "application/rtf",
  rtx: "text/richtext",
  sh: "application/x-sh",
  shar: "application/x-shar",
  smf: "audio/x-midi",
  snd: "audio/basic",
  src: "application/x-wais-source",
  sv4cpio: "application/x-sv4cpio",
  sv4crc: "application/x-sv4crc",
  swf: "application/x-shockwave-flash",
  t: "application/x-troff",
  tar: "application/x-tar",
  tcl: "application/x-tcl",
  tex: "application/x-tex",
  texi: "application/x-texinfo",
  texinfo: "application/x-texinfo",
  tif: "image/tiff",
  tiff: "image/tiff",
  tr: "application/x-troff",
  tsv: "text/tab-separated-values",
  txt: "text/plain",
  ulw: "audio/basic",
  ustar: "application/x-ustar",
  xbm: "image/x-xbitmap",
  xpm: "image/x-xpixmap",
  xwd: "image/x-xwindowdump",
  wav: "audio/x-wav",
  wbmp: "image/vnd.wap.wbmp",
  wml: "text/vnd.wap.wml",
  wmlc: "application/vnd.wap.wmlc",
  wmls: "text/vnd.wap.wmlscript",
  wmlscriptc: "application/vnd.wap.wmlscriptc",
  wrl: "x-world/x-vrml",
  Z: "application/x-compress",
  z: "application/x-compress",
  zip: "application/zip",
};

export function guessMimeType(path) {
  const partesExt = /[.]([^/.]+)$/.exec(path);
  if (partesExt == null) {
    return "application/octet-stream";
  }
  const guessed = EXTENSION_MAP[partesExt[1]];
  if (guessed != undefined) {
    return guessed;
  }
  return "application/octet-stream";
}
