namespace ReservaQuadras.API.Entities
{
    public class Quadra
    {
        public int Id { get; set; }

        public string Nome { get; set; }

        public string Tipo { get; set; }

        public decimal PrecoHora { get; set; }

        public bool Ativa { get; set; }

        public int? DuracaoReservaMinutos { get; set; }

        public ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();

        public TimeSpan HoraAbertura { get; set; }

        public TimeSpan HoraFechamento { get; set; }
    }
}
