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