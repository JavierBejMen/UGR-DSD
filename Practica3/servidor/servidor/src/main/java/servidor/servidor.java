// servidor.java = Programa servidor
package servidor;
import contador.contador;
import java.net.MalformedURLException;
import java.rmi.*;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
import java.rmi.server.*;
public class servidor {
 public static void main(String[] args) {
 if (System.getSecurityManager() == null) {System.setSecurityManager(new
SecurityManager());}
 try {
Registry reg;
try{
    //Crea registro si no esta ya creado
    reg=LocateRegistry.createRegistry(1099);
}catch (RemoteException e){
    System.out.println("Exception: " + e.getMessage());
    System.out.println("Registry already created launching replica");
    reg=LocateRegistry.getRegistry(1099);
}
//Crear contador y registrar replica    
contador micontador = new contador(reg.list().length);
Naming.bind(String.valueOf(reg.list().length), micontador);
System.out.println("Registered replica "+(reg.list().length-1));


System.out.println("Servidor RemoteException | MalformedURLExceptiondor preparado");
 } catch (Exception e) {
System.out.println("Exception: " + e.getMessage());
 }
 }
}
