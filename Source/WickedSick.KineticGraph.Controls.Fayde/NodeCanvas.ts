/// <reference path="Fayde.d.ts" />
/// <reference path="Physics/Engine.ts" />
/// CODE
/// <reference path="Graph.ts" />

module KineticGraph.Controls {
    class NodeState implements Physics.INodeState {
        Position = { X: 0.0, Y: 0.0 };
        Velocity = { X: 0.0, Y: 0.0 };
        Force = { X: 0.0, Y: 0.0 };
        IsFrozen = false;
    }

    export class NodeCanvas extends Fayde.Controls.Canvas implements Physics.INode {
        Linkable: ILinkable;
        PhysicalState: Physics.INodeState;
        Degree: number;

        Graph: Graph;

        private _Circle = new Fayde.Shapes.Ellipse();

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

        get Radius(): number { return this._Circle.Width / 2; }
        set Radius(value: number) {
            this._Circle.Width = 2 * value;
            this._Circle.Height = 2 * value;
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
            circle.Width = 20;
            circle.Height = 20;
            var fill = new Fayde.Media.SolidColorBrush();
            fill.Color = Color.FromRgba(128, 128, 128, 0.5);
            circle.Fill = fill;
            var stroke = new Fayde.Media.SolidColorBrush();
            stroke.Color = Color.FromRgba(128, 128, 128, 1.0);
            circle.Stroke = stroke;
            circle.StrokeThickness = 2.0;
            this.Children.Add(circle);
        }

        UpdatePosition() {
            Fayde.Controls.Canvas.SetLeft(this, this.PhysicalState.Position.X - (this._Circle.ActualWidth / 2));
            Fayde.Controls.Canvas.SetTop(this, this.PhysicalState.Position.Y - (this._Circle.ActualHeight / 2));
        }

        private _LastPos: Point;
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
                var delta = new Point(curPos.X - this._LastPos.X, curPos.Y - this._LastPos.Y);
                this.PhysicalState.Position.X += delta.X;
                this.PhysicalState.Position.Y += delta.Y;
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