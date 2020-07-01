namespace cpp calculadora
namespace py calculadora

struct parametros{
 1:double param_1;
 2:double param_2;
}

service Calculadora{
  double suma(1:parametros params);
  double mul(1:parametros params);
  double div(1:parametros params);
  double res(1:parametros params);
}
