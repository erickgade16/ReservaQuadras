namespace ReservaQuadras.API.Entites
{
    public class Quadra
    {
        public int Id { get; set; }

        public string Nome { get; set; } = string.Empty;

        public string Tipo { get; set; } = string.Empty;

        public decimal PrecoHora { get; set; }

        public bool Ativa { get; set; } = true;

        public ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();
    }
}
