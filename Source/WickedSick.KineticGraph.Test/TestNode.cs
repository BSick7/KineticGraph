using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WickedSick.KineticGraph.Controls;

namespace WickedSick.KineticGraph.Test
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