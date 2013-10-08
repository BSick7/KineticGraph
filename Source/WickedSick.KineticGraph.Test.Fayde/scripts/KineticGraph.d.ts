/// <reference path="Fayde.d.ts" />
declare module KineticGraph.Controls {
    interface ILinkable {
        UniqueID: string;
    }
}
declare module KineticGraph.Controls.Physics {
    interface IVector {
        X: number;
        Y: number;
    }
    interface INodeState {
        IsFrozen: boolean;
        Position: IVector;
        Velocity: IVector;
        Force: IVector;
    }
    class ForceHelper {
        static AttractionConstant: number;
        static ApplyCoulombRepulsion(a: INodeState, b: INodeState, k: number): void;
        static ApplyHookeAttraction(a: INodeState, b: INodeState, k: number): void;
    }
}
declare module KineticGraph.Controls.Physics {
    interface INode {
        Linkable: Controls.ILinkable;
        PhysicalState: Physics.INodeState;
        Degree: number;
        Radius: number;
    }
    interface IEdge {
        Source: INode;
        Sink: INode;
    }
    class Engine {
        private _KE;
        private _Nodes;
        private _Edges;
        private _IsGraphStabilized;
        private _IsGraphDisturbed;
        public Repulsion: number;
        public SpringTension: number;
        public GraphStabilized: MulticastEvent<EventArgs>;
        public GraphStabilizing: MulticastEvent<EventArgs>;
        public Attach(nodes: INode[], edges: IEdge[]): void;
        public Step(): void;
        public ApplyForces(): number;
        public Disturb(): void;
    }
}
declare module KineticGraph.Controls {
    class NodeCanvas extends Fayde.Controls.Canvas implements Controls.Physics.INode {
        public Linkable: Controls.ILinkable;
        public PhysicalState: Controls.Physics.INodeState;
        public Degree: number;
        public Graph: Controls.Graph;
        private _Circle;
        static IsSelectedProperty: DependencyProperty;
        public IsSelected: boolean;
        private OnIsSelectedChanged(args);
        public Radius : number;
        public ManualMovement: MulticastEvent<EventArgs>;
        constructor();
        public UpdatePosition(): void;
        private _LastPos;
        private _IsDragging;
        private Node_MouseLeftButtonDown(sender, e);
        private Node_MouseLeftButtonUp(sender, e);
        private Node_MouseMove(sender, e);
        private Node_LostMouseCapture(sender, e);
    }
}
declare module KineticGraph.Controls {
    class EdgeCanvas extends Fayde.Controls.Canvas implements Controls.Physics.IEdge {
        public Source: Controls.Physics.INode;
        public Sink: Controls.Physics.INode;
        private _Line;
        private _Triangle;
        public Left : number;
        public Top : number;
        constructor();
        public UpdatePosition(): void;
        private SetCoordinates(a, b);
    }
}
declare module KineticGraph.Controls {
    interface ILinkableEdge {
        Source: Controls.ILinkable;
        Sink: Controls.ILinkable;
    }
}
declare module KineticGraph.Controls {
    class Graph extends Fayde.Controls.Canvas implements Fayde.ITimerListener {
        private _Engine;
        private _CanvasScale;
        private _CanvasTranslate;
        private _Timer;
        private Nodes;
        private Edges;
        static SelectedNodeProperty: DependencyProperty;
        public SelectedNode: Controls.NodeCanvas;
        private OnSelectedNodeChanged(args);
        static NodesSourceProperty: DependencyProperty;
        public NodesSource: Fayde.IEnumerable<Controls.ILinkable>;
        private OnNodesSourceChanged(args);
        private NodesSource_CollectionChanged(sender, e);
        static EdgesSourceProperty: DependencyProperty;
        public EdgesSource: Fayde.IEnumerable<Controls.ILinkableEdge>;
        private OnEdgesSourceChanged(args);
        private EdgesSource_CollectionChanged(sender, e);
        static RepulsionProperty: DependencyProperty;
        public Repulsion: number;
        private OnRepulsionChanged(args);
        static SpringTensionProperty: DependencyProperty;
        public SpringTension: number;
        private OnSpringTensionChanged(args);
        constructor();
        public OnTicked(lastTime: number, nowTime: number): void;
        private _LastPos;
        private _IsDragging;
        private Graph_MouseLeftButtonDown(sender, e);
        private Graph_MouseMove(sender, e);
        private Graph_MouseLeftButtonUp(sender, e);
        private Graph_LostMouseCapture(sender, e);
        public ResetMovement(): void;
        public Center(): void;
        private _LastVisualTick;
        private UpdateVisuals();
        private AddEdges(newEdges);
        private FindOrAddEdge(newEdge);
        private AddEdge(gedge);
        private RemoveEdges(oldEdges);
        private RemoveEdge(edge);
        private ClearEdges();
        private FindEdgeIndex(edge);
        private AddNodes(newLinkables);
        private FindOrAddNode(linkable);
        private AddNode(newLinkable);
        private RemoveNodes(oldLinkables);
        private RemoveNode(oldLinkable);
        private ClearNodes();
        private FindNodeIndex(linkable);
        private Node_ManualMovement(sender, e);
        private _GetRandomVector();
    }
}
