using System;
using WickedSick.KineticGraph.Controls;

namespace WickedSick.KineticGraph.Test.ViewModels
{
    public class TestNode : ILinkable
    {
        public TestNode()
        {
            UniqueID = Guid.NewGuid();
        }

        public Guid UniqueID { get; protected set; }

        public TestEdge Connect(TestNode otherNode)
        {
            return new TestEdge(this, otherNode);
        }
    }
}