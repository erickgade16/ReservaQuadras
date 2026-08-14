import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import { buscarUsuarios } from "../../services/api";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    try {
      setCarregando(true);
      setErro("");

      const dados = await buscarUsuarios();

      
      // Garante que o DataTable sempre receba um array
      if (Array.isArray(dados)) {
        setUsuarios(dados);
      } else if (Array.isArray(dados?.data)) {
        setUsuarios(dados.data);
      } else {
        console.error("Formato inesperado da API:", dados);
        setUsuarios([]);
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      setErro("Não foi possível carregar os usuários.");
      setUsuarios([]);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Box>
      <PageHeader
        titulo="Usuários"
        descricao="Gerencie os usuários cadastrados no sistema."
        textoBotao="Novo Usuário"
        onClick={() => console.log("Novo usuário")}
      />

      {erro && (
        <Typography color="error" sx={{ mb: 2 }}>
          {erro}
        </Typography>
      )}

      <DataTable
        columns={[
          {
            field: "nome",
            label: "Nome",
          },
          {
            field: "email",
            label: "E-mail",
          },
          {
  field: "dataCadastro",
  label: "Data de Cadastro",
  render: (usuario) => {
    if (!usuario?.dataCadastro) {
      return "-";
    }

    const [dia, mes, ano] = usuario.dataCadastro.split("/");

    const data = new Date(ano, mes - 1, dia);

    if (isNaN(data.getTime())) {
      return "Data inválida";
    }

    return data.toLocaleDateString("pt-BR");
  },
},
        ]}
        rows={usuarios}
        loading={carregando}
        emptyMessage="Nenhum usuário cadastrado."
      />
    </Box>
  );
}