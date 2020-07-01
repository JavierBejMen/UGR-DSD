

struct parametros {
  int param_1;
  int param_2;
};

struct parametros_vec{
  int * param_1;
  int * param_2;
};

typedef int parametro;

program SUMPROG{
  version SUMPROGSERVER{
    int SUM (parametros) = 1;
  } = 1;
} = 0x20000001;

program MULPROG{
  version MULPROGSERVER{
    int MUL (parametros) = 1;
  } = 1;
} = 0x20000002;

program DIVPROG{
  version DIVPROGSERVER{
    double DIV (parametros) = 1;
  } = 1;
} = 0x20000003;

program RESPROG{
  version RESPROGSERVER{
    int RES (parametros) = 1;
  } = 1;
} = 0x20000004;

program RAIZPROG{
  version RAIZPROGSERVER{
    double RAIZ (parametro) = 1;
  } = 1;
} = 0x20000005;

program EXPPROG{
  version EXPPROGSERVER{
    int EXP (parametro) = 1;
  } = 1;
} = 0x20000006;

program SUMVECPROG{
  version SUMVECPROGSERVER{
    int SUMVEC (parametros_vec) = 1;
  } = 1;
} = 0x20000007;
