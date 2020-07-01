// cliente.java
package cliente;
import icontador.icontador;
import java.rmi.registry.LocateRegistry;
import java.rmi.*;
import java.rmi.registry.Registry;
import java.util.Scanner;
public class cliente {
public static void main(String[] args) {

String host = "";
 Scanner teclado = new Scanner (System.in);
 System.out.println ("Escriba el nombre o IP del servidor: ");
 host = teclado.nextLine();
 
 System.out.println ("Escriba el numero de cliente");
 int nCliente = -1;
 nCliente = Integer.parseInt(teclado.nextLine());
// Crea e instala el gestor de seguridad
if (System.getSecurityManager() == null) {System.setSecurityManager(new SecurityManager());}
try {
// Crea el stub para el cliente especificando el nombre del servidor
Registry mireg = LocateRegistry.getRegistry(host, 1099);
int replica;
//icontador micontador = (icontador)mireg.lookup("1");
icontador micontador =(icontador) mireg.lookup(mireg.list()[0]);
replica = micontador.registrarCliente(nCliente, mireg);
if(replica != -1){
    micontador =(icontador) mireg.lookup(mireg.list()[replica]);
    System.out.println("Me he registrado en la replica "+replica);
    boolean seguir = true;
    while(seguir){
        // Obtiene hora de comienzo
        long horacomienzo = System.currentTimeMillis();
        // Incrementa 1000 veces
        System.out.println("Incrementando...");
        for (int i = 0 ; i < 1000 ; i++ ) {
        micontador.incrementar(nCliente);
        }
        // Obtiene hora final, realiza e imprime calculos
        long horafin = System.currentTimeMillis();
        System.out.println("Media de las RMI realizadas = "+ ((horafin - horacomienzo)/1000f)
         + " msegs");
        System.out.println("RMI globales realizadas = " + micontador.sumar(nCliente, mireg));
        
        //continuar
        System.out.println ("Continuar Y/n ");
        String control = "Y";
        control = teclado.nextLine();
        switch(control.toUpperCase()){
            case "Y":
                seguir = true;
                break;
            case "N":
                seguir = false;
                break;
            default:
                seguir = true;
        }
    }
}else{
    System.out.println("No me he podido registrar");
}

} catch(NotBoundException | RemoteException e) {
System.err.println("Exception del sistema: " + e);
}
System.exit(0);
}
}
