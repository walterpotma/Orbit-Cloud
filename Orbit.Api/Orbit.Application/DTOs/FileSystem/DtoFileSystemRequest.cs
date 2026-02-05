namespace Orbit.Api.Dto.FileSystem
{
    public class DtoFilesystemRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Path { get; set; } = string.Empty;
        public string Type { get; set; }
        public long SizeInBytes { get; set; }
        public DateTime LastModified { get; set; }
    }
}
