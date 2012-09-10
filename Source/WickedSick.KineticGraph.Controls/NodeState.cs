using System.Windows;

namespace WickedSick.KineticGraph.Controls
{
    public struct NodeState
    {
        public Point Position;
        public Point Velocity;
        public Point Force;
        public bool IsBeingDragged;
    }
}