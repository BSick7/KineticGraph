
namespace WickedSick.KineticGraph.Controls
{
    internal class Node
    {
        internal ILinkable Linkable { get; set; }
        internal NodeState PhysicalState { get; set; }
        internal int Degree { get; set; }

        public Node()
        {
            PhysicalState = new NodeState();
        }
    }
}