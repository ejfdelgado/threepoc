import { Deferred } from "./Deferred.mjs";
import { Cronometro } from "./Cronometro.mjs";

export class Amortiguar {
    constructor(ESPERA) {
        this.ESPERA = ESPERA;
        this.contadores = {};
        this.accion = {};
        this.anteriores = {};
    }

    darPermiso(llave) {
        console.log('darPermiso', llave);
        const diferido = new Deferred();
        var siempre = () => {
            if (!(llave in this.contadores)) {
                this.contadores[llave] = 0;
            }
            this.contadores[llave]++;
            var id = this.contadores[llave];
            if (!(llave in this.anteriores)) {
                this.anteriores[llave] = [];
            }
            var refAnteriores = this.anteriores[llave];
            refAnteriores.push(diferido);
            console.log(id+' espera...');
            const micronometro = new Cronometro(llave+'-'+id);
            micronometro.tic();
            setTimeout(() => {
                const toc = micronometro.toc();
                if (id == this.contadores[llave]) {
                    console.log(`Nadie ha llegado después de mi, yo hago la tarea despues de ${toc}ms!`);
                    //Yo desarrollo la acción
                    var desarrollo = new Deferred();
                    this.accion[llave] = desarrollo;
                    var quitarBandera = (recalculo) => {
                        //Acción de limpieza cuando se termina de realizar la acción!
                        delete this.accion[llave];
                        while (refAnteriores.length > 0) {
                            var diferidoAnterior = refAnteriores.splice(0, 1)[0];
                            if (diferidoAnterior != diferido) {
                                diferidoAnterior.reject(recalculo);
                            }
                        }
                    };
                    desarrollo.promise.then(quitarBandera, quitarBandera);
                    //Acá se le avisa a quien pidió hacer la acción, 
                    //que YA la puede realizar
                    diferido.resolve(desarrollo);
                } else {
                    console.log('Alguien más llegó y va a hacer la tarea');
                    //diferido.reject();
                }
            }, this.ESPERA);
        };
        if (llave in this.accion) {
            //Alguien está trabajando en la acción solicitada
            this.accion[llave].then(siempre, siempre);
        } else {
            //Nadie está trabajando en la acción
            //Hago la fila
            siempre();
        }
        return diferido.promise;
    }
}