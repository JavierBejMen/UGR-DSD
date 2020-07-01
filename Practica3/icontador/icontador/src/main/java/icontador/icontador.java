// icontador.java
package icontador;
import java.rmi.NotBoundException;
import java.rmi.Remote;
import java.rmi.RemoteException;
import java.rmi.registry.Registry;
import java.util.ArrayList;
public interface icontador extends Remote {
int sumar(int cliente, Registry reg) throws RemoteException, NotBoundException;
void sumar (int cliente, int valor) throws RemoteException;
public int incrementar(int cliente) throws RemoteException;
public int registrarCliente(int cliente, Registry reg) throws RemoteException, NotBoundException;
public boolean isRegistered(int cliente) throws RemoteException;
public ArrayList<Integer> getClientes() throws RemoteException;
public int sumar() throws RemoteException;
public void regCliente(int cliente) throws RemoteException;

}
