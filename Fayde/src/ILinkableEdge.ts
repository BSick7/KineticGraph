/// <reference path="ILinkable.ts" />

module Fayde.KineticGraph {
    export interface ILinkableEdge {
        Source: ILinkable;
        Sink: ILinkable;
    }
}