/// <reference path="Fayde.d.ts" />
/// <reference path="Physics/Engine.ts" />
/// <reference path="NodeCanvas.ts" />
/// <reference path="EdgeCanvas.ts" />
/// <reference path="ILinkable.ts" />
/// <reference path="ILinkableEdge.ts" />

module KineticGraph.Controls {
    var MAX_FPS = 100;
    var MAX_MSPF = 1000 / MAX_FPS;

    var MIN_ALLOWED_REPULSION = 10.0;
    var MIN_ALLOWED_SPRING_TENSION = 0.0001;

    export class Graph extends Fayde.Controls.Canvas implements Fayde.ITimerListener {
        private _Engine = new Physics.Engine();

        private _CanvasScale: Fayde.Media.ScaleTransform;
        private _CanvasTranslate: Fayde.Media.TranslateTransform;

        private _Timer: Fayde.ClockTimer;

        private Nodes: NodeCanvas[] = [];
        private Edges: EdgeCanvas[] = [];

        static SelectedNodeProperty = DependencyProperty.Register("SelectedNode", () => NodeCanvas, Graph, undefined, (d, args) => (<Graph>d).OnSelectedNodeChanged(args));
        SelectedNode: NodeCanvas;
        private OnSelectedNodeChanged(args: IDependencyPropertyChangedEventArgs) {
            var oldNode = <NodeCanvas>args.OldValue;
            if (oldNode != null && oldNode.IsSelected)
                oldNode.SetCurrentValue(NodeCanvas.IsSelectedProperty, false);
        }

        static NodesSourceProperty = DependencyProperty.Register("NodesSource", () => Fayde.IEnumerable_, Graph, undefined, (d, args) => (<Graph>d).OnNodesSourceChanged(args));
        NodesSource: Fayde.IEnumerable<ILinkable>;
        private OnNodesSourceChanged(args: IDependencyPropertyChangedEventArgs) {
            var oldNC = <Fayde.Collections.INotifyCollectionChanged>args.OldValue;
            if (Nullstone.ImplementsInterface(oldNC, Fayde.Collections.INotifyCollectionChanged_))
                oldNC.CollectionChanged.Unsubscribe(this.NodesSource_CollectionChanged, this);
            this.RemoveNodes(args.OldValue);

            var newNC = <Fayde.Collections.INotifyCollectionChanged>args.NewValue;
            this.AddNodes(args.NewValue);
            if (Nullstone.ImplementsInterface(newNC, Fayde.Collections.INotifyCollectionChanged_))
                newNC.CollectionChanged.Subscribe(this.NodesSource_CollectionChanged, this);
        }
        private NodesSource_CollectionChanged(sender: any, e: Fayde.Collections.NotifyCollectionChangedEventArgs) {
            switch (e.Action) {
                case Fayde.Collections.NotifyCollectionChangedAction.Add:
                    this.AddNodes(Fayde.ArrayEx.AsEnumerable(e.NewItems));
                    break;
                case Fayde.Collections.NotifyCollectionChangedAction.Remove:
                    this.RemoveNodes(Fayde.ArrayEx.AsEnumerable(e.OldItems));
                    break;
                case Fayde.Collections.NotifyCollectionChangedAction.Reset:
                    this.ClearNodes();
                    break;
                case Fayde.Collections.NotifyCollectionChangedAction.Replace:
                    this.AddNodes(Fayde.ArrayEx.AsEnumerable(e.NewItems));
                    this.RemoveNodes(Fayde.ArrayEx.AsEnumerable(e.OldItems));
                    break;
            }
        }

        static EdgesSourceProperty = DependencyProperty.Register("EdgesSource", () => Fayde.IEnumerable_, Graph, undefined, (d, args) => (<Graph>d).OnEdgesSourceChanged(args));
        EdgesSource: Fayde.IEnumerable<ILinkableEdge>;
        private OnEdgesSourceChanged(args: IDependencyPropertyChangedEventArgs) {
            var oldNC = <Fayde.Collections.INotifyCollectionChanged>args.OldValue;
            if (Nullstone.ImplementsInterface(oldNC, Fayde.Collections.INotifyCollectionChanged_))
                oldNC.CollectionChanged.Unsubscribe(this.EdgesSource_CollectionChanged, this);
            this.RemoveNodes(args.OldValue);

            var newNC = <Fayde.Collections.INotifyCollectionChanged>args.NewValue;
            this.AddEdges(args.NewValue);
            if (Nullstone.ImplementsInterface(newNC, Fayde.Collections.INotifyCollectionChanged_))
                newNC.CollectionChanged.Subscribe(this.EdgesSource_CollectionChanged, this);
        }
        private EdgesSource_CollectionChanged(sender: any, e: Fayde.Collections.NotifyCollectionChangedEventArgs) {
            switch (e.Action) {
                case Fayde.Collections.NotifyCollectionChangedAction.Add:
                    this.AddEdges(Fayde.ArrayEx.AsEnumerable(e.NewItems));
                    break;
                case Fayde.Collections.NotifyCollectionChangedAction.Remove:
                    this.RemoveEdges(Fayde.ArrayEx.AsEnumerable(e.OldItems));
                    break;
                case Fayde.Collections.NotifyCollectionChangedAction.Reset:
                    this.ClearEdges();
                    break;
                case Fayde.Collections.NotifyCollectionChangedAction.Replace:
                    this.AddEdges(Fayde.ArrayEx.AsEnumerable(e.NewItems));
                    this.RemoveEdges(Fayde.ArrayEx.AsEnumerable(e.OldItems));
                    break;
            }
        }

        static RepulsionProperty = DependencyProperty.Register("Repulsion", () => Number, Graph, 300.0, (d, args) => (<Graph>d).OnRepulsionChanged(args));
        Repulsion: number;
        private OnRepulsionChanged(args: IDependencyPropertyChangedEventArgs) {
            if (args.NewValue < MIN_ALLOWED_REPULSION)
                throw new ArgumentOutOfRangeException("Repulsion");
            this._Engine.Repulsion = args.NewValue;
            this._Engine.Disturb();
        }

        static SpringTensionProperty = DependencyProperty.Register("SpringTension", () => Number, Graph, 0.0009, (d, args) => (<Graph>d).OnSpringTensionChanged(args));
        SpringTension: number;
        private OnSpringTensionChanged(args: IDependencyPropertyChangedEventArgs) {
            if (args.NewValue < MIN_ALLOWED_SPRING_TENSION)
                throw new ArgumentOutOfRangeException("SpringTension");
            this._Engine.SpringTension = args.NewValue;
            this._Engine.Disturb();
        }

        constructor() {
            super();

            this._Engine.Attach(this.Nodes, this.Edges);

            this.ResetMovement();

            var bg = new Fayde.Media.SolidColorBrush();
            bg.Color = Color.KnownColors.Transparent;
            this.Background = bg;

            this.MouseLeftButtonDown.Subscribe(this.Graph_MouseLeftButtonDown, this);
            this.MouseLeftButtonUp.Subscribe(this.Graph_MouseLeftButtonUp, this);
            this.MouseMove.Subscribe(this.Graph_MouseMove, this);
            this.LostMouseCapture.Subscribe(this.Graph_LostMouseCapture, this);

            this._Timer = new Fayde.ClockTimer();
            this._Timer.RegisterTimer(this);
        }

        OnTicked(lastTime: number, nowTime: number) {
            this._Engine.Step();
            this.UpdateVisuals();
        }

        private _LastPos: Point = null;
        private _IsDragging = false;
        private Graph_MouseLeftButtonDown(sender: any, e: Fayde.Input.MouseButtonEventArgs) {
            if (e.Handled)
                return;
            e.Handled = this._IsDragging = this.CaptureMouse();
            this._LastPos = e.GetPosition(this);
        }
        private Graph_MouseMove(sender: any, e: Fayde.Input.MouseEventArgs) {
            if (this._IsDragging) {
                var curPos = e.GetPosition(this);
                var delta = new Point(curPos.X - this._LastPos.X, curPos.Y - this._LastPos.Y);
                this._CanvasTranslate.X += delta.X;
                this._CanvasTranslate.Y += delta.Y;
                this._LastPos = curPos;
            }
        }
        private Graph_MouseLeftButtonUp(sender: any, e: Fayde.Input.MouseButtonEventArgs) {
            this.ReleaseMouseCapture();
        }
        private Graph_LostMouseCapture(sender: any, e: Fayde.Input.MouseEventArgs) {
            this._IsDragging = false;
        }


        ResetMovement() {
            var tg = new Fayde.Media.TransformGroup();
            tg.Children.Add(this._CanvasScale = new Fayde.Media.ScaleTransform());
            tg.Children.Add(this._CanvasTranslate = new Fayde.Media.TranslateTransform());
            this.RenderTransform = tg;
        }
        Center() {
            var nodes = this.Nodes;
            var count = nodes.length;
            var totX = 0.0;
            var totY = 0.0;

            var enumerator = Fayde.ArrayEx.GetEnumerator(nodes);
            var node: NodeCanvas;
            while (enumerator.MoveNext()) {
                node = enumerator.Current;
                totX += node.PhysicalState.Position.X;
                totY += node.PhysicalState.Position.Y;
            }
            this._CanvasTranslate.X = (this.ActualWidth / 2) - (totX / count);
            this._CanvasTranslate.Y = (this.ActualHeight / 2) - (totY / count);
        }

        private _LastVisualTick: number = new Date(0).getTime();
        private UpdateVisuals() {
            var now = new Date().getTime();
            if (now - this._LastVisualTick < MAX_MSPF)
                return;
            this._LastVisualTick = now;

            var enumerator = Fayde.ArrayEx.GetEnumerator(this.Nodes);
            while (enumerator.MoveNext()) {
                enumerator.Current.UpdatePosition();
            }

            var enumerator2 = Fayde.ArrayEx.GetEnumerator(this.Edges);
            while (enumerator2.MoveNext()) {
                enumerator2.Current.UpdatePosition();
            }
        }


        private AddEdges(newEdges: Fayde.IEnumerable<ILinkableEdge>) {
            if (!newEdges)
                return;
            var enumerator = newEdges.GetEnumerator();
            while (enumerator.MoveNext()) {
                this.FindOrAddEdge(enumerator.Current);
            }
        }
        private FindOrAddEdge(newEdge: ILinkableEdge): EdgeCanvas {
            var index = this.FindEdgeIndex(newEdge);
            if (index > -1)
                return this.Edges[index];
            return this.AddEdge(newEdge);
        }
        private AddEdge(gedge: ILinkableEdge): EdgeCanvas {
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
        private RemoveEdges(oldEdges: Fayde.IEnumerable<ILinkableEdge>) {
            if (!oldEdges)
                return;
            var enumerator = oldEdges.GetEnumerator();
            while (enumerator.MoveNext()) {
                this.RemoveEdge(enumerator.Current);
            }
        }
        private RemoveEdge(edge: ILinkableEdge) {
            var index = this.FindEdgeIndex(edge);
            if (index < 0)
                return;
            var existing = this.Edges.splice(index, 1)[0];
            this.Children.Remove(existing);
            existing.Sink.Degree--;
            existing.Source.Degree--;
            this._Engine.Disturb();
        }
        private ClearEdges() {
            var enumerator = Fayde.ArrayEx.GetEnumerator(this.Edges);
            while (enumerator.MoveNext()) {
                this.Children.Remove(enumerator.Current);
            }
            this.Edges = [];
            this._Engine.Disturb();
        }
        private FindEdgeIndex(edge: ILinkableEdge): number {
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

        private AddNodes(newLinkables: Fayde.IEnumerable<ILinkable>) {
            if (!newLinkables)
                return;
            var enumerator = newLinkables.GetEnumerator();
            while (enumerator.MoveNext()) {
                this.FindOrAddNode(enumerator.Current);
            }
        }
        private FindOrAddNode(linkable: ILinkable): NodeCanvas {
            var index = this.FindNodeIndex(linkable);
            if (index > -1)
                return this.Nodes[index];
            return this.AddNode(linkable);
        }
        private AddNode(newLinkable: ILinkable): NodeCanvas {
            var node = new NodeCanvas();
            node.Linkable = newLinkable;
            node.Graph = this;
            this.Nodes.push(node);
            this.Children.Add(node);
            node.ManualMovement.Subscribe(this.Node_ManualMovement, this);
            node.PhysicalState.Position = this._GetRandomVector();
            this._Engine.Disturb();
            return node;
        }
        private RemoveNodes(oldLinkables: Fayde.IEnumerable<ILinkable>) {
            if (!oldLinkables)
                return;
            var enumerator = oldLinkables.GetEnumerator();
            while (enumerator.MoveNext()) {
                this.RemoveNode(enumerator.Current);
            }
        }
        private RemoveNode(oldLinkable: ILinkable) {
            var index = this.FindNodeIndex(oldLinkable);
            if (index < 0)
                return;
            var existing = this.Nodes.splice(index, 1)[0];
            existing.ManualMovement.Unsubscribe(this.Node_ManualMovement, this);
            existing.Graph = null;
            this.Children.Remove(existing);
            this._Engine.Disturb();
        }
        private ClearNodes() {
            var enumerator = Fayde.ArrayEx.GetEnumerator(this.Nodes);
            var node: NodeCanvas;
            while (enumerator.MoveNext()) {
                node = enumerator.Current;
                node.ManualMovement.Unsubscribe(this.Node_ManualMovement, this);
                node.Graph = null;
                this.Children.Remove(node);
            }
            this.Nodes = [];
            this._Engine.Disturb();
        }
        private FindNodeIndex(linkable: ILinkable): number {
            var nodes = this.Nodes;
            var len = nodes.length;
            for (var i = 0; i < len; i++) {
                if (nodes[i].Linkable.UniqueID === linkable.UniqueID)
                    return i;
            }
            return -1;
        }
        private Node_ManualMovement(sender: any, e: EventArgs) {
            this._Engine.Disturb();
        }

        private _GetRandomVector(): Physics.IVector {
            var width = this.ActualWidth;
            if (width <= 0)
                width = 100;
            var height = this.ActualHeight;
            if (height <= 0)
                height = 100;
            return { X: randomInt(0, width), Y: randomInt(0, height) };
        }
    }
    Fayde.RegisterType(Graph, {
        Name: "Graph",
        Namespace: "KineticGraph.Controls",
        XmlNamespace: "http://schemas.wsick.com/kineticgraph"
    });

    function randomInt(low: number, high: number): number {
        return Math.floor(Math.random() * (high - low) + low);
    }
}