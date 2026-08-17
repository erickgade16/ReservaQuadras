using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

public class TimeSpanConverter : JsonConverter<TimeSpan>
{
    public override TimeSpan Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options)
    {
        var valor = reader.GetString();

        if (string.IsNullOrWhiteSpace(valor))
        {
            throw new JsonException("Horário não informado.");
        }

        if (TimeSpan.TryParse(
            valor,
            CultureInfo.InvariantCulture,
            out var resultado))
        {
            return resultado;
        }

        throw new JsonException(
            $"Horário inválido: {valor}");
    }

    public override void Write(
        Utf8JsonWriter writer,
        TimeSpan value,
        JsonSerializerOptions options)
    {
        writer.WriteStringValue(
            value.ToString(@"hh\:mm"));
    }
}