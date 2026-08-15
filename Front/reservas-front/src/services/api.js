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
