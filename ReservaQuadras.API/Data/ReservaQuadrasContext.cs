using ReservaQuadras.API.Entites;
using Microsoft.EntityFrameworkCore;

namespace ReservaQuadras.API.Data
{
    public class ReservaQuadrasContext : DbContext
    {
        public ReservaQuadrasContext(
            DbContextOptions<ReservaQuadrasContext> options)
            : base(options)
        {
        }

        public DbSet<Usuario> Usuarios { get; set; }

        public DbSet<Quadra> Quadras { get; set; }

        public DbSet<Reserva> Reservas { get; set; }
    }
}
