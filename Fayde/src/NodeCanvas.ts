/// <reference path="Physics/Engine.ts" />
/// CODE
/// <reference path="Graph.ts" />

module Fayde.KineticGraph {
    import Point = minerva.Point;

    class NodeState implements Physics.INodeState {
        Position = { X: 0.0, Y: 0.0 };
        Velocity = { X: 0.0, Y: 0.0 };
        Force = { X: 0.0, Y: 0.0 };
        IsFrozen = false;
    }

    export class NodeCanvas extends Fayde.Controls.Canvas implements Physics.INode {
        private _Linkable: ILinkable = null;
        get Linkable(): ILinkable { return this._Linkable; }
        set Linkable(value: ILinkable) {
            this._Linkable = value;
            this.DataContext = value;
        }
        PhysicalState: Physics.INodeState;
        Degree: number = 0.0;

        Graph: Graph = null;

        private _Circle = new Fayde.Shapes.Ellipse();
        private _TextBlock = new Fayde.Controls.TextBlock();

        static IsSelectedProperty = DependencyProperty.Register("IsSelected", () => Boolean, NodeCanvas, false, (d, args) => (<NodeCanvas>d).OnIsSelectedChanged(args));
        IsSelected: boolean;
        private OnIsSelectedChanged(args: IDependencyPropertyChangedEventArgs) {
            if (args.OldValue === args.NewValue)
                return;

            if (args.NewValue === true) {
                console.log("Highlight me!");
            } else {
                console.log("Unhighlight me!");
            }

            if (this.Graph != null)
                this.Graph.SetCurrentValue(Graph.SelectedNodeProperty, this);
        }

        static RadiusProperty = DependencyProperty.Register("Radius", () => Number, NodeCanvas, 15.0, (d, args) => (<NodeCanvas>d).OnRadiusChanged(args));
        Radius: number;
        private OnRadiusChanged(args: IDependencyPropertyChangedEventArgs) {
            var radius = args.NewValue;
            this.UpdateMarkers();
        }

        ManualMovement = new MulticastEvent<EventArgs>();

        constructor() {
            super();

            this.PhysicalState = new NodeState();

            this.MouseLeftButtonDown.Subscribe(this.Node_MouseLeftButtonDown, this);
            this.MouseLeftButtonUp.Subscribe(this.Node_MouseLeftButtonUp, this);
            this.MouseMove.Subscribe(this.Node_MouseMove, this);
            this.LostMouseCapture.Subscribe(this.Node_LostMouseCapture, this);

            var circle = this._Circle;
            circle.Fill = new Fayde.Media.SolidColorBrush(Color.FromRgba(128, 128, 128, 0.5));
            circle.Stroke = new Fayde.Media.SolidColorBrush(Color.FromRgba(128, 128, 128, 1.0));
            circle.StrokeThickness = 2.0;
            this.Children.Add(circle);
            
            var tb = this._TextBlock;
            tb.SetBinding(Fayde.Controls.TextBlock.TextProperty, new Fayde.Data.Binding(""));
            tb.SizeChanged.Subscribe(this.TextBlock_SizeChanged, this);
            this.Children.Add(tb);
        }

        UpdatePosition() {
            Fayde.Controls.Canvas.SetLeft(this, this.PhysicalState.Position.X - (this._Circle.ActualWidth / 2));
            Fayde.Controls.Canvas.SetTop(this, this.PhysicalState.Position.Y - (this._Circle.ActualHeight / 2));
        }

        SetDisplayMemberPath(path: string) {
            this._TextBlock.SetBinding(Fayde.Controls.TextBlock.TextProperty, new Fayde.Data.Binding(path));
        }

        private TextBlock_SizeChanged(sender: any, e: Fayde.SizeChangedEventArgs) { this.UpdateMarkers(); }
        private UpdateMarkers() {
            var radius = this.Radius;
            this._Circle.Width = 2 * radius;
            this._Circle.Height = 2 * radius;
            
            var tbw = this._TextBlock.ActualWidth;
            var tbh = this._TextBlock.ActualHeight;
            this._TextBlock.SetValue(Fayde.Controls.Canvas.LeftProperty, radius - tbw / 2.0);
            this._TextBlock.SetValue(Fayde.Controls.Canvas.TopProperty, radius - tbh / 2.0);
        }

        private _LastPos: Point = null;
        private _IsDragging = false;
        private Node_MouseLeftButtonDown(sender: any, e: Fayde.Input.MouseButtonEventArgs) {
            if (e.Handled)
                return;
            e.Handled = this.PhysicalState.IsFrozen = this._IsDragging = this.CaptureMouse();
            this._LastPos = e.GetPosition(this.VisualParent);
        }
        private Node_MouseLeftButtonUp(sender: any, e: Fayde.Input.MouseButtonEventArgs) {
            this.ReleaseMouseCapture();
        }
        private Node_MouseMove(sender: any, e: Fayde.Input.MouseEventArgs) {
            if (this._IsDragging) {
                var curPos = e.GetPosition(this.VisualParent);
                var delta = new Point(curPos.x - this._LastPos.x, curPos.y - this._LastPos.y);
                this.PhysicalState.Position.X += delta.x;
                this.PhysicalState.Position.Y += delta.y;
                this._LastPos = curPos;
            }
        }
        private Node_LostMouseCapture(sender: any, e: Fayde.Input.MouseEventArgs) {
            this.PhysicalState.IsFrozen = false;
            this._IsDragging = false;
            this.ManualMovement.Raise(this, EventArgs.Empty);
        }
    }
}