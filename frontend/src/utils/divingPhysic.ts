
export const calculateATM = (profundidadProm: number) => {
  return profundidadProm / 10 + 1;
};

export const calculateSAC = (
  pi: number, 
  pf: number, 
  volumen: number, 
  atm: number, 
  tiempo: number
) => {
  if (tiempo === 0 || atm === 0) return 0;
  const consumoTotal = (pi - pf) * volumen;
  const factorCarga = atm * tiempo;
  return (consumoTotal / factorCarga).toFixed(1);
};