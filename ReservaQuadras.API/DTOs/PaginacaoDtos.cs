using ReservaQuadras.API.Entities;

namespace ReservaQuadras.API.DTOs;

public class ConsultaPaginada
{
    private int _pagina = 1;
    private int _tamanho = 10;

    // Página começa em 1
    public int Pagina
    {
        get => _pagina;
        set => _pagina = value < 1 ? 1 : value;
    }

    // Tamanho limitado a 100 para a API não ser usada para despejar tudo de uma vez
    public int Tamanho
    {
        get => _tamanho;
        set => _tamanho = value < 1 ? 10 : Math.Min(value, 100);
    }

    public string? Busca { get; set; }

    public bool? Ativo { get; set; }

    public string? OrdenarPor { get; set; }

    public string? Direcao { get; set; }

    public bool Descendente =>
        string.Equals(Direcao, "desc", StringComparison.OrdinalIgnoreCase);
}

public class ConsultaReservas : ConsultaPaginada
{
    public int? QuadraId { get; set; }

    public DateTime? Data { get; set; }
}

public class PaginadoResponse<T>
{
    public List<T> Itens { get; set; } = new();

    public int Total { get; set; }

    public int Pagina { get; set; }

    public int TamanhoPagina { get; set; }

    public int TotalPaginas =>
        TamanhoPagina <= 0 ? 0 : (int)Math.Ceiling(Total / (double)TamanhoPagina);

    public static PaginadoResponse<T> Criar(
        List<T> itens,
        int total,
        ConsultaPaginada consulta)
    {
        return new PaginadoResponse<T>
        {
            Itens = itens,
            Total = total,
            Pagina = consulta.Pagina,
            TamanhoPagina = consulta.Tamanho
        };
    }
}

public class QuadraResumo
{
    public int Id { get; set; }

    public string Nome { get; set; } = string.Empty;
}

// Reserva sem dados sensíveis (nunca devolve a senha do usuário)
public class ReservaListaItem
{
    public int Id { get; set; }

    public int UsuarioId { get; set; }

    public int QuadraId { get; set; }

    public DateTime DataReserva { get; set; }

    public TimeSpan HoraInicio { get; set; }

    public TimeSpan HoraFim { get; set; }

    public bool Ativo { get; set; }

    public DateTime DataCriacao { get; set; }

    public UsuarioResponse? Usuario { get; set; }

    public QuadraResumo? Quadra { get; set; }

    public static ReservaListaItem De(Reserva r)
    {
        return new ReservaListaItem
        {
            Id = r.Id,
            UsuarioId = r.UsuarioId,
            QuadraId = r.QuadraId,
            DataReserva = r.DataReserva,
            HoraInicio = r.HoraInicio,
            HoraFim = r.HoraFim,
            Ativo = r.Ativo,
            DataCriacao = r.DataCriacao,
            Usuario = r.Usuario == null
                ? null
                : new UsuarioResponse
                {
                    Id = r.Usuario.Id,
                    Nome = r.Usuario.Nome,
                    Email = r.Usuario.Email
                },
            Quadra = r.Quadra == null
                ? null
                : new QuadraResumo
                {
                    Id = r.Quadra.Id,
                    Nome = r.Quadra.Nome
                }
        };
    }
}

// Usuário sem dados sensíveis (nunca devolve a senha)
public class UsuarioListaItem
{
    public int Id { get; set; }

    public string Nome { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public bool Ativo { get; set; }

    public bool Bloqueado { get; set; }

    public DateTime DataCadastro { get; set; }

    public static UsuarioListaItem De(Usuario u)
    {
        return new UsuarioListaItem
        {
            Id = u.Id,
            Nome = u.Nome,
            Email = u.Email,
            Ativo = u.Ativo,
            Bloqueado = u.Bloqueado,
            DataCadastro = u.DataCadastro
        };
    }
}
