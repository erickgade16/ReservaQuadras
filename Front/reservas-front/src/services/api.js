const API_URL = "https://localhost:7127/api";

function obterHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
}

async function tratarErroResponse(response, mensagemPadrao) {
  const texto = await response.text();

  if (!texto) {
    throw new Error(mensagemPadrao);
  }

  try {
    const erro = JSON.parse(texto);

    if (erro?.errors) {
      const mensagens = Object.values(erro.errors).flat();

      if (mensagens.length > 0) {
        throw new Error(mensagens[0]);
      }
    }

    if (typeof erro === "string") {
      throw new Error(erro);
    }

    if (erro?.message) {
      throw new Error(erro.message);
    }

    if (erro?.title) {
      throw new Error(erro.title);
    }
  } catch (error) {
    if (
      error instanceof SyntaxError
    ) {
      throw new Error(texto);
    }

    throw error;
  }

  throw new Error(mensagemPadrao);
}

// =========================
// QUADRAS
// =========================

export async function buscarQuadras() {
  const response = await fetch(`${API_URL}/Quadras`, {
    headers: obterHeaders(),
  });

  if (!response.ok) {
    await tratarErroResponse(
      response,
      "Não foi possível buscar as quadras."
    );
  }

  return response.json();
}

export async function criarQuadra(quadra) {
  const response = await fetch(`${API_URL}/Quadras`, {
    method: "POST",
    headers: obterHeaders(),
    body: JSON.stringify(quadra),
  });

  if (!response.ok) {
    await tratarErroResponse(
      response,
      "Não foi possível criar a quadra."
    );
  }

  return response.json();
}

export async function editarQuadra(id, quadra) {
  const response = await fetch(`${API_URL}/Quadras/${id}`, {
    method: "PUT",
    headers: obterHeaders(),
    body: JSON.stringify(quadra),
  });

  if (!response.ok) {
    await tratarErroResponse(
      response,
      "Não foi possível editar a quadra."
    );
  }

  return response.json();
}

export async function alterarStatusQuadra(id, ativa) {
  const response = await fetch(
    `${API_URL}/Quadras/${id}/status`,
    {
      method: "PATCH",
      headers: obterHeaders(),
      body: JSON.stringify(ativa),
    }
  );

  if (!response.ok) {
    await tratarErroResponse(
      response,
      "Não foi possível alterar o status da quadra."
    );
  }

  return response.json();
}

// =========================
// USUÁRIOS
// =========================

export async function buscarUsuarios() {
  const response = await fetch(`${API_URL}/Usuarios`, {
    headers: obterHeaders(),
  });

  if (!response.ok) {
    await tratarErroResponse(
      response,
      "Não foi possível buscar os usuários."
    );
  }

  return response.json();
}

export async function criarUsuario(usuario) {
  const response = await fetch(`${API_URL}/Usuarios`, {
    method: "POST",
    headers: obterHeaders(),
    body: JSON.stringify(usuario),
  });

  if (!response.ok) {
    await tratarErroResponse(
      response,
      "Não foi possível criar o usuário."
    );
  }

  return response.json();
}

export async function editarUsuario(id, usuario) {
  const response = await fetch(`${API_URL}/Usuarios/${id}`, {
    method: "PUT",
    headers: obterHeaders(),
    body: JSON.stringify(usuario),
  });

  if (!response.ok) {
    await tratarErroResponse(
      response,
      "Não foi possível editar o usuário."
    );
  }

  return response.json();
}

export async function alterarStatusUsuario(id, ativo) {
  const response = await fetch(
    `${API_URL}/Usuarios/${id}/status`,
    {
      method: "PATCH",
      headers: obterHeaders(),
      body: JSON.stringify(ativo),
    }
  );

  if (!response.ok) {
    await tratarErroResponse(
      response,
      "Não foi possível alterar o status do usuário."
    );
  }

  return response.json();
}

// =========================
// RESERVAS
// =========================

export async function buscarReservas() {
  const response = await fetch(`${API_URL}/Reservas`, {
    headers: obterHeaders(),
  });

  if (!response.ok) {
    await tratarErroResponse(
      response,
      "Não foi possível buscar as reservas."
    );
  }

  return response.json();
}

export async function buscarHorariosDisponiveis(quadraId, data) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/Reservas/quadra/${quadraId}/horarios-disponiveis?data=${data}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Não foi possível buscar os horários.");
  }

  return await response.json();
}

export async function criarReserva(reserva) {
  const response = await fetch(`${API_URL}/Reservas`, {
    method: "POST",
    headers: obterHeaders(),
    body: JSON.stringify(reserva),
  });

  if (!response.ok) {
    await tratarErroResponse(
      response,
      "Não foi possível criar a reserva."
    );
  }

  return response.json();
}

export async function editarReserva(id, reserva) {
  const response = await fetch(`${API_URL}/Reservas/${id}`, {
    method: "PUT",
    headers: obterHeaders(),
    body: JSON.stringify(reserva),
  });

  if (!response.ok) {
    await tratarErroResponse(
      response,
      "Não foi possível editar a reserva."
    );
  }

  return response.json();
}

export async function alterarStatusReserva(id, ativa) {
  const response = await fetch(
    `${API_URL}/Reservas/${id}/status`,
    {
      method: "PATCH",
      headers: obterHeaders(),
      body: JSON.stringify(ativa),
    }
  );

  if (!response.ok) {
    await tratarErroResponse(
      response,
      "Não foi possível alterar o status da reserva."
    );
  }

  return response.json();
}

export async function fazerLogin(email, senha) {
  const response = await fetch(`${API_URL}/Auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      senha,
    }),
  });

  if (!response.ok) {
    await tratarErroResponse(
      response,
      "Não foi possível realizar o login."
    );
  }

  return await response.json();
}