/// <reference path="Fayde.d.ts" />
/// <reference path="Physics/Engine.ts" />

module KineticGraph.Controls {
    export class EdgeCanvas extends Fayde.Controls.Canvas implements Physics.IEdge {
        Source: Physics.INode;
        Sink: Physics.INode;

        private _IsBidirectional: boolean = false;
        get IsBidirectional(): boolean { return this._IsBidirectional; }
        set IsBidirectional(value: boolean) {
            this._IsBidirectional = value;
            this._Triangle.Visibility = value === true ? Fayde.Visibility.Visible : Fayde.Visibility.Collapsed;
        }

        private _Line: Fayde.Shapes.Line;
        private _Triangle: Fayde.Shapes.Polygon;

        get Left(): number { return this.GetValue(Fayde.Controls.Canvas.LeftProperty); }
        set Left(value: number) { this.SetValue(Fayde.Controls.Canvas.LeftProperty, value); }

        get Top(): number { return this.GetValue(Fayde.Controls.Canvas.TopProperty); }
        set Top(value: number) { this.SetValue(Fayde.Controls.Canvas.TopProperty, value); }

        constructor() {
            super();

            this.IsHitTestVisible = false;

            this.Children.Add(this._Line = buildLine());
            this.Children.Add(this._Triangle = buildTriangle(5, 9));
            this._Triangle.Visibility = this.IsBidirectional === true ? Fayde.Visibility.Visible : Fayde.Visibility.Collapsed;
        }

        UpdatePosition() {
            var source = this.Source;
            var sink = this.Sink;

            var a = source == null ? { X: 0, Y: 0 } : source.PhysicalState.Position;
            var b = sink == null ? { X: 0, Y: 0 } : sink.PhysicalState.Position;

            var theta = getLineAngle(a, b);
            if (isNaN(theta))
                return;
            var thetaRad = theta * (Math.PI / 180);
            //double thetaRev = thetaRad - (Math.PI*2.0);

            var sp = source == null ? a : getEdgeOfCircle(a, thetaRad, source.Radius, true);
            var ep = sink == null ? b : getEdgeOfCircle(b, thetaRad, sink.Radius, false);

            var x1 = Math.min(sp.X, ep.X);
            var x2 = Math.max(sp.X, ep.X);
            var y1 = Math.min(sp.Y, ep.Y);
            var y2 = Math.max(sp.Y, ep.Y);

            //Define boundaries
            this.Left = x1;
            this.Top = y1;
            this.Width = x2 - x1;
            this.Height = y2 - y1;

            //Place line link on the correct corners of canvas
            this._Line.X1 = ep.X > sp.X ? 0 : this.Width;
            this._Line.Y1 = ep.Y > sp.Y ? 0 : this.Height;
            this._Line.X2 = ep.X > sp.X ? this.Width : 0;
            this._Line.Y2 = ep.Y > sp.Y ? this.Height : 0;

            //Rotate the arrow then move it to the desired position
            var tg = new Fayde.Media.TransformGroup();

            var rt = new Fayde.Media.RotateTransform();
            rt.Angle = theta;
            rt.CenterX = this._Triangle.Width / 2;
            rt.CenterY = this._Triangle.Height / 2;
            tg.Children.Add(rt);

            var tt = new Fayde.Media.TranslateTransform();
            tt.X = this.Width / 2 - this._Triangle.Width / 2;
            tt.Y = this.Height / 2 - this._Triangle.Height / 2;
            tg.Children.Add(tt);

            this._Triangle.RenderTransform = tg;
        }
    }
    Fayde.RegisterType(EdgeCanvas, {
        Name: "EdgeCanvas",
        Namespace: "KineticGraph.Controls"
    });

    function buildLine(): Fayde.Shapes.Line {
        var line = new Fayde.Shapes.Line();
        line.StrokeThickness = 1.0;
        var stroke = new Fayde.Media.SolidColorBrush();
        stroke.Color = Color.KnownColors.Black;
        line.Stroke = stroke;
        return line;
    }
    function buildTriangle(width: number, height: number): Fayde.Shapes.Polygon {
        var p = new Fayde.Shapes.Polygon();
        p.Width = width;
        p.Height = height;
        var fill = new Fayde.Media.SolidColorBrush();
        fill.Color = Color.KnownColors.Black;
        p.Fill = fill;
        p.Points.Add(new Point(0, 0));
        p.Points.Add(new Point(width, height / 2));
        p.Points.Add(new Point(0, height));
        return p;
    }
    function getLineAngle(a: Physics.IVector, b: Physics.IVector): number {
        var xDist = Math.abs(a.X - b.X);
        var yDist = Math.abs(a.Y - b.Y);
        var theta = Math.atan(yDist / xDist);
        theta *= 180 / Math.PI; //convert to degrees

        if (b.Y > a.Y) //top quadrants
            return b.X >= a.X ? theta : 180 - theta;
        return b.X < a.X ? 180 + theta : 360 - theta;
    }
    function getEdgeOfCircle(p: Physics.IVector, theta: number, radius: number, start: boolean): Physics.IVector {
        var tempX = p.X;
        var tempY = p.Y;
        tempX += Math.cos(theta) * radius * (start ? 1 : -1);
        tempY += Math.sin(theta) * radius * (start ? 1 : -1);
        return { X: tempX, Y: tempY };
    }
}