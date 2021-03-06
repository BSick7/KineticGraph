declare module Fayde.KineticGraph {
    var version: string;
}
declare module Fayde.KineticGraph {
    interface ILinkable {
        UniqueID: string;
    }
}
declare module Fayde.KineticGraph.Physics {
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
declare module Fayde.KineticGraph.Physics {
    interface INode {
        Linkable: ILinkable;
        PhysicalState: INodeState;
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
        Repulsion: number;
        SpringTension: number;
        GraphStabilized: nullstone.Event<{}>;
        GraphStabilizing: nullstone.Event<{}>;
        Attach(nodes: INode[], edges: IEdge[]): void;
        Step(): void;
        ApplyForces(): number;
        Disturb(): void;
    }
}
declare module Fayde.KineticGraph {
    class EdgeCanvas extends Fayde.Controls.Canvas implements Physics.IEdge {
        Source: Physics.INode;
        Sink: Physics.INode;
        private _IsBidirectional;
        IsBidirectional: boolean;
        private _Line;
        private _Triangle;
        Left: number;
        Top: number;
        constructor();
        UpdatePosition(): void;
    }
}
declare module Fayde.KineticGraph {
    class NodeCanvas extends Fayde.Controls.Canvas implements Physics.INode {
        private _Linkable;
        Linkable: ILinkable;
        PhysicalState: Physics.INodeState;
        Degree: number;
        Graph: Graph;
        private _Circle;
        private _TextBlock;
        static IsSelectedProperty: DependencyProperty;
        IsSelected: boolean;
        private OnIsSelectedChanged(args);
        static RadiusProperty: DependencyProperty;
        Radius: number;
        private OnRadiusChanged(args);
        ManualMovement: nullstone.Event<{}>;
        constructor();
        UpdatePosition(): void;
        SetDisplayMemberPath(path: string): void;
        private TextBlock_SizeChanged(sender, e);
        private UpdateMarkers();
        private _LastPos;
        private _IsDragging;
        private Node_MouseLeftButtonDown(sender, e);
        private Node_MouseLeftButtonUp(sender, e);
        private Node_MouseMove(sender, e);
        private Node_LostMouseCapture(sender, e);
    }
}
declare module Fayde.KineticGraph {
    interface ILinkableEdge {
        Source: ILinkable;
        Sink: ILinkable;
    }
}
declare module Fayde.KineticGraph {
    class Graph extends Fayde.Controls.Canvas implements Fayde.ITimerListener {
        private _Engine;
        private _CanvasScale;
        private _CanvasTranslate;
        private _Timer;
        private Nodes;
        private Edges;
        static IsBidirectionalProperty: DependencyProperty;
        static SelectedNodeProperty: DependencyProperty;
        static NodesSourceProperty: DependencyProperty;
        static EdgesSourceProperty: DependencyProperty;
        static RepulsionProperty: DependencyProperty;
        static SpringTensionProperty: DependencyProperty;
        static NodeDisplayMemberPathProperty: DependencyProperty;
        static NodeWeightPathProperty: DependencyProperty;
        IsBidirectional: boolean;
        SelectedNode: NodeCanvas;
        NodesSource: nullstone.IEnumerable<ILinkable>;
        EdgesSource: nullstone.IEnumerable<ILinkableEdge>;
        Repulsion: number;
        SpringTension: number;
        NodeDisplayMemberPath: string;
        NodeWeightPath: string;
        private OnIsBidirectionalChanged(args);
        private OnSelectedNodeChanged(args);
        private OnNodesSourceChanged(args);
        private NodesSource_CollectionChanged(sender, e);
        private OnEdgesSourceChanged(args);
        private EdgesSource_CollectionChanged(sender, e);
        private OnRepulsionChanged(args);
        private OnSpringTensionChanged(args);
        private OnNodeDisplayMemberPathChanged(args);
        private OnNodeWeightPathChanged(args);
        private SetNodeWeightPath(nodeCanvas, path);
        constructor();
        OnTicked(lastTime: number, nowTime: number): void;
        private _LastPos;
        private _IsDragging;
        private Graph_MouseLeftButtonDown(sender, e);
        private Graph_MouseMove(sender, e);
        private Graph_MouseLeftButtonUp(sender, e);
        private Graph_LostMouseCapture(sender, e);
        private Graph_SizeChanged(sender, e);
        ResetMovement(): void;
        Center(): void;
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
