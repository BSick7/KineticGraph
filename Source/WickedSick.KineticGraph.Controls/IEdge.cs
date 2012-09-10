
namespace WickedSick.KineticGraph.Controls
{
    public interface IEdge
    {
        ILinkable Source { get; }
        ILinkable Sink { get; }
    }
}