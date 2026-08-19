const API_URL = "https://localhost:7127/api";

export async function buscarQuadras() {
  const response = await fetch(`${API_URL}/Quadras`);

  if (!response.ok) {
    throw new Error("Erro ao buscar quadras");
  }

  return await response.json();
}

export async function criarQuadra(quadra) {
  const response = await fetch(`${API_URL}/Quadras`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(quadra),
  });

  if (!response.ok) {
    throw new Error("Erro ao criar quadra");
  }
  return await response.json();
}

export async function editarQuadra(id, quadra) {
  const response = await fetch(`${API_URL}/Quadras/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(quadra),
  });

  if (!response.ok) {
    throw new Error("Erro ao editar quadra");
  }
}

export async function buscarUsuarios() {
  const response = await fetch(`${API_URL}/Usuarios`);

  if (!response.ok) {
    throw new Error("Erro ao buscar usuários");
  }

  return await response.json();
}

export async function criarUsuario(usuario) {
  const response = await fetch(`${API_URL}/Usuarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(usuario),
  });

  if (!response.ok) {
    const erro = await response.text();

    console.error("Erro ao criar usuário:", erro);

    throw new Error("Erro ao criar usuário.");
  }

  return await response.json();
}

export async function editarUsuario(id, usuario) {
  const response = await fetch(`${API_URL}/Usuarios/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(usuario),
  });

  if (!response.ok) {
    throw new Error("Erro ao editar usuário");
  }
}

export async function buscarReservas() {
  const response = await fetch(`${API_URL}/Reservas`);

  if (!response.ok) {
    throw new Error("Erro ao buscar reservas.");
  }

  return await response.json();
}

export async function criarReserva(reserva) {
  const response = await fetch(`${API_URL}/Reservas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reserva),
  });

  if (!response.ok) {
    const erro = await response.text();

    console.error("Erro ao criar reserva:", erro);

    throw new Error("Erro ao criar reserva.");
  }

  return await response.json();
}

export async function editarReserva(id, reserva) {
  const response = await fetch(`${API_URL}/Reservas/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reserva),
  });

  if (!response.ok) {
    throw new Error("Erro ao editar reserva");
  }
}

export async function alterarStatusUsuario(id, ativo) {
  const response = await fetch(
    `${API_URL}/Usuarios/${id}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ativo),
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao alterar status do usuário");
  }

  return response.json();
}

export async function alterarStatusReserva(id, ativo) {
  const response = await fetch(
    `${API_URL}/Reservas/${id}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ativo),
    }
  );

  if (!response.ok) {
    const erro = await response.text();

    console.error(
      "Erro ao alterar status:",
      response.status,
      erro
    );

    throw new Error(
      "Erro ao alterar status da reserva"
    );
  }

  return response.json();
}

export async function alterarStatusQuadra(id, ativa) {
  const response = await fetch(
    `${API_URL}/Quadras/${id}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ativa),
    }
  );

  if (!response.ok) {
    const erro = await response.text();

    console.error(
      "Erro ao alterar status:",
      response.status,
      erro
    );

    throw new Error(
      "Erro ao alterar status da quadra"
    );
  }

  return response.json();
}



