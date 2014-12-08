/// <reference path="Physics/Engine.ts" />
/// <reference path="NodeCanvas.ts" />
/// <reference path="EdgeCanvas.ts" />
/// <reference path="ILinkable.ts" />
/// <reference path="ILinkableEdge.ts" />

module Fayde.KineticGraph {
    var MAX_FPS = 100;
    var MAX_MSPF = 1000 / MAX_FPS;

    var MIN_ALLOWED_REPULSION = 10.0;
    var MIN_ALLOWED_SPRING_TENSION = 0.0001;

    import Point = minerva.Point;

    export class Graph extends Fayde.Controls.Canvas implements Fayde.ITimerListener {
        private _Engine = new Physics.Engine();

        private _CanvasScale: Fayde.Media.ScaleTransform;
        private _CanvasTranslate: Fayde.Media.TranslateTransform;

        private _Timer: Fayde.ClockTimer;

        private Nodes: NodeCanvas[] = [];
        private Edges: EdgeCanvas[] = [];

        static IsBidirectionalProperty = DependencyProperty.Register("IsBidirectional", () => Boolean, Graph, false, (d: Graph, args) => d.OnIsBidirectionalChanged(args));
        static SelectedNodeProperty = DependencyProperty.Register("SelectedNode", () => NodeCanvas, Graph, undefined, (d: Graph, args) => d.OnSelectedNodeChanged(args));
        static NodesSourceProperty = DependencyProperty.Register("NodesSource", () => nullstone.IEnumerable_, Graph, undefined, (d: Graph, args) => d.OnNodesSourceChanged(args));
        static EdgesSourceProperty = DependencyProperty.Register("EdgesSource", () => nullstone.IEnumerable_, Graph, undefined, (d: Graph, args) => d.OnEdgesSourceChanged(args));
        static RepulsionProperty = DependencyProperty.Register("Repulsion", () => Number, Graph, 300.0, (d: Graph, args) => d.OnRepulsionChanged(args));
        static SpringTensionProperty = DependencyProperty.Register("SpringTension", () => Number, Graph, 0.0009, (d: Graph, args) => d.OnSpringTensionChanged(args));
        static NodeDisplayMemberPathProperty = DependencyProperty.Register("NodeDisplayMemberPath", () => String, Graph, undefined, (d: Graph, args) => d.OnNodeDisplayMemberPathChanged(args));
        static NodeWeightPathProperty = DependencyProperty.Register("NodeWeightPath", () => String, Graph, undefined, (d: Graph, args) => d.OnNodeWeightPathChanged(args));

        IsBidirectional: boolean;
        SelectedNode: NodeCanvas;
        NodesSource: nullstone.IEnumerable<ILinkable>;
        EdgesSource: nullstone.IEnumerable<ILinkableEdge>;
        Repulsion: number;
        SpringTension: number;
        NodeDisplayMemberPath: string;
        NodeWeightPath: string;

        private OnIsBidirectionalChanged (args: IDependencyPropertyChangedEventArgs) {
            var isb = args.NewValue === true;
            this.Edges.forEach(e => e.IsBidirectional = isb);
        }

        private OnSelectedNodeChanged (args: IDependencyPropertyChangedEventArgs) {
            var oldNode = <NodeCanvas>args.OldValue;
            if (oldNode != null && oldNode.IsSelected)
                oldNode.SetCurrentValue(NodeCanvas.IsSelectedProperty, false);
        }

        private OnNodesSourceChanged (args: IDependencyPropertyChangedEventArgs) {
            var oldNC = Fayde.Collections.INotifyCollectionChanged_.as(args.OldValue);
            if (oldNC)
                oldNC.CollectionChanged.off(this.NodesSource_CollectionChanged, this);
            this.RemoveNodes(coerceToArray(args.OldValue));

            this.AddNodes(coerceToArray(args.NewValue));
            var newNC = Fayde.Collections.INotifyCollectionChanged_.as(args.NewValue);
            if (newNC)
                newNC.CollectionChanged.on(this.NodesSource_CollectionChanged, this);
        }

        private NodesSource_CollectionChanged (sender: any, e: Fayde.Collections.CollectionChangedEventArgs) {
            switch (e.Action) {
                case Fayde.Collections.CollectionChangedAction.Add:
                    this.AddNodes(e.NewItems);
                    break;
                case Fayde.Collections.CollectionChangedAction.Remove:
                    this.RemoveNodes(e.OldItems);
                    break;
                case Fayde.Collections.CollectionChangedAction.Reset:
                    this.ClearNodes();
                    break;
                case Fayde.Collections.CollectionChangedAction.Replace:
                    this.AddNodes(e.NewItems);
                    this.RemoveNodes(e.OldItems);
                    break;
            }
        }

        private OnEdgesSourceChanged (args: IDependencyPropertyChangedEventArgs) {
            var oldNC = Fayde.Collections.INotifyCollectionChanged_.as(args.OldValue);
            if (oldNC)
                oldNC.CollectionChanged.off(this.EdgesSource_CollectionChanged, this);
            this.RemoveNodes(coerceToArray(args.OldValue));

            this.AddEdges(coerceToArray(args.NewValue));
            var newNC = Fayde.Collections.INotifyCollectionChanged_.as(args.NewValue);
            if (newNC)
                newNC.CollectionChanged.on(this.EdgesSource_CollectionChanged, this);
        }

        private EdgesSource_CollectionChanged (sender: any, e: Fayde.Collections.CollectionChangedEventArgs) {
            switch (e.Action) {
                case Fayde.Collections.CollectionChangedAction.Add:
                    this.AddEdges(e.NewItems);
                    break;
                case Fayde.Collections.CollectionChangedAction.Remove:
                    this.RemoveEdges(e.OldItems);
                    break;
                case Fayde.Collections.CollectionChangedAction.Reset:
                    this.ClearEdges();
                    break;
                case Fayde.Collections.CollectionChangedAction.Replace:
                    this.AddEdges(e.NewItems);
                    this.RemoveEdges(e.OldItems);
                    break;
            }
        }

        private OnRepulsionChanged (args: IDependencyPropertyChangedEventArgs) {
            if (args.NewValue < MIN_ALLOWED_REPULSION)
                throw new ArgumentOutOfRangeException("Repulsion");
            this._Engine.Repulsion = args.NewValue;
            this._Engine.Disturb();
        }

        private OnSpringTensionChanged (args: IDependencyPropertyChangedEventArgs) {
            if (args.NewValue < MIN_ALLOWED_SPRING_TENSION)
                throw new ArgumentOutOfRangeException("SpringTension");
            this._Engine.SpringTension = args.NewValue;
            this._Engine.Disturb();
        }

        private OnNodeDisplayMemberPathChanged (args: IDependencyPropertyChangedEventArgs) {
            var path = args.NewValue || "";
            this.Nodes.forEach(n => n.SetDisplayMemberPath(path));
        }

        private OnNodeWeightPathChanged (args: IDependencyPropertyChangedEventArgs) {
            var path = args.NewValue || "";
            this.Nodes.forEach(n => this.SetNodeWeightPath(n, path));
        }

        private SetNodeWeightPath (nodeCanvas: NodeCanvas, path: string) {
            if (!path)
                return nodeCanvas.ClearValue(NodeCanvas.RadiusProperty);
            nodeCanvas.SetBinding(NodeCanvas.RadiusProperty, new Fayde.Data.Binding(path));
        }

        constructor () {
            super();

            this._Engine.Attach(this.Nodes, this.Edges);

            this.ResetMovement();

            var bg = new Fayde.Media.SolidColorBrush();
            bg.Color = Color.KnownColors.Transparent;
            this.Background = bg;

            this.MouseLeftButtonDown.on(this.Graph_MouseLeftButtonDown, this);
            this.MouseLeftButtonUp.on(this.Graph_MouseLeftButtonUp, this);
            this.MouseMove.on(this.Graph_MouseMove, this);
            this.LostMouseCapture.on(this.Graph_LostMouseCapture, this);
            this.SizeChanged.on(this.Graph_SizeChanged, this);

            this._Timer = new Fayde.ClockTimer();
            this._Timer.RegisterTimer(this);
        }

        OnTicked (lastTime: number, nowTime: number) {
            this._Engine.Step();
            this.UpdateVisuals();
        }

        private _LastPos: Point = null;
        private _IsDragging = false;

        private Graph_MouseLeftButtonDown (sender: any, e: Fayde.Input.MouseButtonEventArgs) {
            if (e.Handled)
                return;
            e.Handled = this._IsDragging = this.CaptureMouse();
            this._LastPos = e.GetPosition(this);
        }

        private Graph_MouseMove (sender: any, e: Fayde.Input.MouseEventArgs) {
            if (this._IsDragging) {
                var curPos = e.GetPosition(this);
                this._CanvasTranslate.X += (curPos.x - this._LastPos.x);
                this._CanvasTranslate.Y += (curPos.y - this._LastPos.y);
                this._LastPos = curPos;
            }
        }

        private Graph_MouseLeftButtonUp (sender: any, e: Fayde.Input.MouseButtonEventArgs) {
            this.ReleaseMouseCapture();
        }

        private Graph_LostMouseCapture (sender: any, e: Fayde.Input.MouseEventArgs) {
            this._IsDragging = false;
        }

        private Graph_SizeChanged (sender: any, e: Fayde.SizeChangedEventArgs) {
            var dw = e.NewSize.width - e.PreviousSize.width;
            var dh = e.NewSize.height - e.PreviousSize.height;
            this._CanvasTranslate.X += dw / 2.0;
            this._CanvasTranslate.Y += dh / 2.0;
        }

        ResetMovement () {
            var tg = new Fayde.Media.TransformGroup();
            tg.Children.Add(this._CanvasScale = new Fayde.Media.ScaleTransform());
            tg.Children.Add(this._CanvasTranslate = new Fayde.Media.TranslateTransform());
            this.RenderTransform = tg;
        }

        Center () {
            var nodes = this.Nodes;
            var count = nodes.length;
            var totX = 0.0;
            var totY = 0.0;

            for (var en = nullstone.IEnumerator_.fromArray(nodes); en.moveNext();) {
                var node = en.current;
                totX += node.PhysicalState.Position.X;
                totY += node.PhysicalState.Position.Y;
            }
            this._CanvasTranslate.X = (this.ActualWidth / 2) - (totX / count);
            this._CanvasTranslate.Y = (this.ActualHeight / 2) - (totY / count);
        }

        private _LastVisualTick: number = new Date(0).getTime();

        private UpdateVisuals () {
            var now = new Date().getTime();
            if (now - this._LastVisualTick < MAX_MSPF)
                return;
            this._LastVisualTick = now;

            this.Nodes.forEach(n => n.UpdatePosition());
            this.Edges.forEach(e => e.UpdatePosition());
        }


        private AddEdges (newEdges: ILinkableEdge[]) {
            if (!newEdges)
                return;
            for (var i = 0, len = newEdges.length; i < len; i++) {
                this.FindOrAddEdge(newEdges[i]);
            }
        }

        private FindOrAddEdge (newEdge: ILinkableEdge): EdgeCanvas {
            var index = this.FindEdgeIndex(newEdge);
            if (index > -1)
                return this.Edges[index];
            return this.AddEdge(newEdge);
        }

        private AddEdge (gedge: ILinkableEdge): EdgeCanvas {
            var edge = new EdgeCanvas();
            edge.Source = this.FindOrAddNode(gedge.Source);
            edge.Sink = this.FindOrAddNode(gedge.Sink);
            if (edge.Source.Linkable.UniqueID === edge.Sink.Linkable.UniqueID)
                return null;
            this.Edges.push(edge);
            edge.Sink.Degree++;
            edge.Source.Degree++;
            this.Children.Add(edge);
            this._Engine.Disturb();
            return edge;
        }

        private RemoveEdges (oldEdges: ILinkableEdge[]) {
            if (!oldEdges)
                return;
            for (var i = 0, len = oldEdges.length; i < len; i++) {
                this.RemoveEdge(oldEdges[i]);
            }
        }

        private RemoveEdge (edge: ILinkableEdge) {
            var index = this.FindEdgeIndex(edge);
            if (index < 0)
                return;
            var existing = this.Edges.splice(index, 1)[0];
            this.Children.Remove(existing);
            existing.Sink.Degree--;
            existing.Source.Degree--;
            this._Engine.Disturb();
        }

        private ClearEdges () {
            this.Edges.forEach(e => this.Children.Remove(e));
            this.Edges = [];
            this._Engine.Disturb();
        }

        private FindEdgeIndex (edge: ILinkableEdge): number {
            var edges = this.Edges;
            var len = edges.length;
            var e: EdgeCanvas;
            for (var i = 0; i < len; i++) {
                e = edges[i];
                if (e.Source.Linkable.UniqueID === edge.Source.UniqueID && e.Sink.Linkable.UniqueID === edge.Sink.UniqueID)
                    return i;
            }
            return -1;
        }

        private AddNodes (newLinkables: ILinkable[]) {
            if (!newLinkables)
                return;
            for (var i = 0, len = newLinkables.length; i < len; i++) {
                this.FindOrAddNode(newLinkables[i]);
            }
        }

        private FindOrAddNode (linkable: ILinkable): NodeCanvas {
            var index = this.FindNodeIndex(linkable);
            if (index > -1)
                return this.Nodes[index];
            return this.AddNode(linkable);
        }

        private AddNode (newLinkable: ILinkable): NodeCanvas {
            var node = new NodeCanvas();
            node.Linkable = newLinkable;
            node.Graph = this;
            this.Nodes.push(node);
            this.Children.Add(node);
            node.ManualMovement.on(this.Node_ManualMovement, this);
            node.PhysicalState.Position = this._GetRandomVector();
            node.SetDisplayMemberPath(this.NodeDisplayMemberPath);
            this.SetNodeWeightPath(node, this.NodeWeightPath);
            this._Engine.Disturb();
            return node;
        }

        private RemoveNodes (oldLinkables: ILinkable[]) {
            if (!oldLinkables)
                return;
            for (var i = 0, len = oldLinkables.length; i < len; i++) {
                this.RemoveNode(oldLinkables[i]);
            }
        }

        private RemoveNode (oldLinkable: ILinkable) {
            var index = this.FindNodeIndex(oldLinkable);
            if (index < 0)
                return;
            var existing = this.Nodes.splice(index, 1)[0];
            existing.ManualMovement.off(this.Node_ManualMovement, this);
            existing.Graph = null;
            this.Children.Remove(existing);
            this._Engine.Disturb();
        }

        private ClearNodes () {
            this.Nodes.forEach(n => {
                n.ManualMovement.off(this.Node_ManualMovement, this);
                n.Graph = null;
                this.Children.Remove(n);
            });
            this.Nodes = [];
            this._Engine.Disturb();
        }

        private FindNodeIndex (linkable: ILinkable): number {
            var nodes = this.Nodes;
            var len = nodes.length;
            for (var i = 0; i < len; i++) {
                if (nodes[i].Linkable.UniqueID === linkable.UniqueID)
                    return i;
            }
            return -1;
        }

        private Node_ManualMovement (sender: any, e: any) {
            this._Engine.Disturb();
        }

        private _GetRandomVector (): Physics.IVector {
            var width = this.ActualWidth;
            if (width <= 0)
                width = 100;
            var height = this.ActualHeight;
            if (height <= 0)
                height = 100;
            return {X: randomInt(0, width), Y: randomInt(0, height)};
        }
    }

    function randomInt (low: number, high: number): number {
        return Math.floor(Math.random() * (high - low) + low);
    }

    function coerceToArray (obj: any): any[] {
        if (obj instanceof Array)
            return obj;
        var en = nullstone.IEnumerable_.as(obj);
        if (en) {
            var arr = [];
            for (var e = en.getEnumerator(); e.moveNext();) {
                arr.push(e.current);
            }
            return arr;
        }
        return [];
    }
}