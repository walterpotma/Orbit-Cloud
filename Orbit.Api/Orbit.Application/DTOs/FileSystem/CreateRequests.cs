namespace Orbit.Application.DTOs.FileSystem
{
    public class CreateDirectoryRequest
    {
        public string Path { get; set; } = string.Empty;
    }

    public class CreateFileRequest
    {
        public string Path { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }
}
