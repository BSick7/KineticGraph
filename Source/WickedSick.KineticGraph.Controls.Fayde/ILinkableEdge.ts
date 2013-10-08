/// <reference path="ILinkable.ts" />

module KineticGraph.Controls {
    export interface ILinkableEdge {
        Source: ILinkable;
        Sink: ILinkable;
    }
}