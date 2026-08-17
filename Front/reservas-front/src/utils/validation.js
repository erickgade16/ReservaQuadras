export const required =
  (message = "Campo obrigatório.") =>
    (value) => {
      if (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
      ) {
        return message;
      }

      return null;
    };

export const email =
  (message = "E-mail inválido.") =>
    (value) => {
      if (!value) {
        return null;
      }

      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      return regex.test(value) ? null : message;
    };

export const minLength =
  (length, message) =>
    (value) => {
      if (!value) {
        return null;
      }

      return value.length < length ? message : null;
    };

export const positive =
  (message = "Informe um valor maior que zero.") =>
    (value) => {
      if (value === undefined || value === null || value === "") {
        return null;
      }

      return Number(value) > 0 ? null : message;
    };

export function validarCampo(value, regras) {
  for (const regra of regras) {
    const erro = regra(value);

    if (erro) {
      return erro;
    }
  }

  return null;
}