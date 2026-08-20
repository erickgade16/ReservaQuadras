export function required(mensagem) {
  return (valor) => {
    if (
      valor === null ||
      valor === undefined ||
      String(valor).trim() === ""
    ) {
      return mensagem;
    }

    return null;
  };
}

export function email(mensagem) {
  return (valor) => {
    if (!valor) {
      return null;
    }

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regex.test(valor.trim()) ? null : mensagem;
  };
}

export function minLength(tamanho, mensagem) {
  return (valor) => {
    if (!valor) {
      return null;
    }

    return String(valor).length >= tamanho
      ? null
      : mensagem;
  };
}

export function positive(mensagem) {
  return (valor) => {
    if (valor === null || valor === undefined || valor === "") {
      return null;
    }

    return Number(valor) > 0 ? null : mensagem;
  };
}

export function horaMaiorQue(
  horaInicial,
  horaFinal,
  mensagem
) {
  if (!horaInicial || !horaFinal) {
    return null;
  }

  if (horaInicial >= horaFinal) {
    return mensagem;
  }

  return null;
}

export function validarCampo(valor, validacoes) {
  for (const validacao of validacoes) {
    const erro = validacao(valor);

    if (erro) {
      return erro;
    }
  }

  return null;
}

export function dataFutura(data, mensagem) {
  if (!data) {
    return null;
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataSelecionada = new Date(`${data}T00:00:00`);

  return dataSelecionada >= hoje ? null : mensagem;
}


export function horarioDentroDoFuncionamento(
  horaInicio,
  horaFim,
  horaAbertura,
  horaFechamento,
  mensagem
) {
  if (
    !horaInicio ||
    !horaFim ||
    !horaAbertura ||
    !horaFechamento
  ) {
    return null;
  }

  if (
    horaInicio < horaAbertura ||
    horaFim > horaFechamento
  ) {
    return mensagem;
  }

  return null;
}