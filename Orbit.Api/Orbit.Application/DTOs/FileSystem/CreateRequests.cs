namespace Orbit.Application.DTOs.FileSystem
{
    public class CreateDirectoryRequest
    {
        public string Path { get; set; } = string.Empty; // Ex: "pasta1/subpasta"
    }

    public class CreateFileRequest
    {
        public string Path { get; set; } = string.Empty; // Ex: "pasta1/arquivo.txt"
        public string Content { get; set; } = string.Empty;
    }
}
