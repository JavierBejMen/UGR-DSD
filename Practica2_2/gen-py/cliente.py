from calculadora import Calculadora
from thrift import Thrift
from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from calculadora.ttypes import *

transport = TSocket.TSocket ('localhost', 9090)
transport = TTransport.TBufferedTransport ( transport )
protocol = TBinaryProtocol.TBinaryProtocol ( transport )
# creamos el cliente
client = Calculadora.Client ( protocol )

transport.open ()
params = parametros(1, 1)
resultado = client.suma(params)
print (str(params.param_1) + " + " + str(params.param_2) + " = " + str(resultado))

params = parametros(2, 3)
resultado = client.mul(params)
print (str(params.param_1) + " * " + str(params.param_2) + " = " + str(resultado))

params = parametros(2, 3)
resultado = client.div(params)
print (str(params.param_1) + " / " + str(params.param_2) + " = " + str(resultado))

params = parametros(2, 3)
resultado = client.res(params)
print (str(params.param_1) + " - " + str(params.param_2) + " = " + str(resultado))

transport.close ()
