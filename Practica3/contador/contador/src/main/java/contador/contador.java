// contador.java
package contador;
import icontador.icontador;
import java.rmi.*;
import java.rmi.server.UnicastRemoteObject;
import java.net.MalformedURLException;
import java.util.ArrayList;
import java.rmi.registry.Registry;

public class contador extends UnicastRemoteObject implements icontador {
private int suma;
private ArrayList<Integer> clientes;
private int nReplica;

public contador(int n) throws RemoteException{
    suma = 0;
    clientes = new ArrayList();
    nReplica = n;
}

public int registrarCliente(int cliente, Registry reg) throws RemoteException, NotBoundException{
    boolean pass = true;
    int min = 999;
    int replica = 0;
    
    for(int i = 0; i < reg.list().length; ++i){
        
        if(i != nReplica){
            icontador aux;
            aux = ((icontador) reg.lookup(reg.list()[i]));
            if( aux.isRegistered(cliente) ){
                pass = false;
            }else{
                if(aux.getClientes().size() < min){
                    min = aux.getClientes().size();
                    replica = i;
                }
            }
        }else{
            if(clientes.contains(cliente)){
                pass = false;
            }else{
                if(clientes.size() < min){
                    min = clientes.size();
                    replica = i;
                }
            }
        }
    }
    if(pass){
        if(replica != nReplica){
            icontador aux;
            aux = ((icontador) reg.lookup(reg.list()[replica]));
            aux.regCliente(cliente);
        }else{
            regCliente(cliente);
        }
        
        return replica; 
    }
    return -1;
}

public ArrayList<Integer> getClientes() throws RemoteException{
    return clientes;
}

public void regCliente(int cliente) throws RemoteException{
    clientes.add(cliente);
    System.out.println("Cliente " + cliente + " registered");
    System.out.println("Clientes totales: "+clientes.toString());
}

public boolean isRegistered(int cliente) throws RemoteException{
    return clientes.contains(cliente);
}

public int sumar() throws RemoteException{
    return suma;
}

public int sumar(int cliente, Registry reg) throws RemoteException, NotBoundException{
    if(isRegistered(cliente)){
        int sumaGlobal = 0;
        icontador aux;
        for(int i = 0; i < reg.list().length; ++i){
            if(i != nReplica){
                aux = ((icontador) reg.lookup(reg.list()[i]));
                sumaGlobal += aux.sumar();
            }else{
                sumaGlobal += suma;
            }
            
        }
        return sumaGlobal;
    }
    return -1;
}
public void sumar(int cliente, int valor) throws RemoteException {
    if(isRegistered(cliente)) suma = valor;
}
    public int incrementar(int cliente) throws RemoteException {
        if(isRegistered(cliente)){
            suma++;
            return suma;
        }

    return -1;
    }
}
