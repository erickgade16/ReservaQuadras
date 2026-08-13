using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

public class TimeSpanConverter : JsonConverter<TimeSpan>
{
    private const string Format = @"hh\:mm\:ss";

    public override TimeSpan Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options)
    {
        return TimeSpan.ParseExact(
            reader.GetString()!,
            Format,
            CultureInfo.InvariantCulture);
    }

    public override void Write(
        Utf8JsonWriter writer,
        TimeSpan value,
        JsonSerializerOptions options)
    {
        writer.WriteStringValue(
            value.ToString(Format));
    }
}