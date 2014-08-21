/// <reference path="../lib/Fayde.KineticGraph/Fayde.KineticGraph.d.ts" />

import ILinkable = Fayde.KineticGraph.ILinkable;

class TestEdge {
    Source: ILinkable;
    Sink: ILinkable;
    constructor(source: ILinkable, sink: ILinkable) {
        this.Source = source;
        this.Sink = sink;
    }
}
export = TestEdge;