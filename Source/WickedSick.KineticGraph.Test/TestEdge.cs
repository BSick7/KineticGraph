﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WickedSick.KineticGraph.Controls;

namespace WickedSick.KineticGraph.Test
{
    public class TestEdge : IEdge
    {
        public TestEdge(ILinkable source, ILinkable sink)
        {
            Source = source;
            Sink = sink;
        }

        public ILinkable Source { get; protected set; }
        public ILinkable Sink { get; protected set; }
    }
}
