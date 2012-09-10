using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Shapes;

namespace WickedSick.KineticGraph.Controls
{
    internal class Edge : Canvas
    {
        public Node Source { get; set; }
        public Node Sink { get; set; }

        private Line _Line;

        public Edge()
        {
            _Line = new Line { StrokeThickness = 2, Stroke = new SolidColorBrush(Colors.Black) };
            Children.Add(_Line);
        }

        protected Point StartPoint { get; set; }
        protected Point EndPoint { get; set; }
        public double Left
        {
            get { return (double)GetValue(LeftProperty); }
            set { SetValue(LeftProperty, value); }
        }
        public double Top
        {
            get { return (double)GetValue(TopProperty); }
            set { SetValue(TopProperty, value); }
        }

        public void UpdatePosition()
        {
            SetCoordinates(Source.PhysicalState.Position, Sink.PhysicalState.Position);
        }

        private void SetCoordinates(Point a, Point b)
        {
            double theta = GetLineAngle(a, b);
            double thetaRad = theta * (Math.PI / 180);
            //double thetaRev = thetaRad - (Math.PI*2.0);

            StartPoint = Source == null ? a : GetEdgeOfCircle(a, thetaRad, Source.Radius, true);
            EndPoint = Sink == null ? b : GetEdgeOfCircle(b, thetaRad, Sink.Radius, false);

            double x1 = Math.Min(StartPoint.X, EndPoint.X);
            double x2 = Math.Max(StartPoint.X, EndPoint.X);
            double y1 = Math.Min(StartPoint.Y, EndPoint.Y);
            double y2 = Math.Max(StartPoint.Y, EndPoint.Y);

            //Define boundaries
            Left = x1;
            Top = y1;
            Width = x2 - x1;
            Height = y2 - y1;

            //Place line link on the correct corners of canvas
            _Line.X1 = EndPoint.X > StartPoint.X ? 0 : Width;
            _Line.Y1 = EndPoint.Y > StartPoint.Y ? 0 : Height;
            _Line.X2 = EndPoint.X > StartPoint.X ? Width : 0;
            _Line.Y2 = EndPoint.Y > StartPoint.Y ? Height : 0;

            /*
            //Rotate the arrow then move it to the desired position
            TransformGroup tg = new TransformGroup();
            tg.Children.Add(new RotateTransform
            {
                Angle = theta,
                CenterX = _Triangle.Width / 2,
                CenterY = _Triangle.Height / 2
            });
            tg.Children.Add(new TranslateTransform
            {
                X = Width / 2 - _Triangle.Width / 2,
                Y = Height / 2 - _Triangle.Height / 2
            });
            _Triangle.RenderTransform = tg;
            */
        }

        #region Helpers

        private static Polygon BuildTriangle(double width, double height)
        {
            Polygon p = new Polygon
            {
                Width = width,
                Height = height,
                Fill = new SolidColorBrush(Colors.Black)
            };
            p.Points.Add(new Point(0, 0));
            p.Points.Add(new Point(width, height / 2));
            p.Points.Add(new Point(0, height));
            return p;
        }

        private static double GetLineAngle(Point a, Point b)
        {
            double xDist = Math.Abs(a.X - b.X);
            double yDist = Math.Abs(a.Y - b.Y);
            double theta = Math.Atan(yDist / xDist);
            theta *= 180 / Math.PI; //convert to degrees

            if (b.Y > a.Y) //top quadrants
            {
                return b.X >= a.X ? theta : 180 - theta;
            }
            return b.X < a.X ? 180 + theta : 360 - theta;
        }

        private static Point GetEdgeOfCircle(Point p, double theta, double radius, bool start)
        {
            double tempX = p.X;
            double tempY = p.Y;
            tempX += Math.Cos(theta) * radius * (start ? 1 : -1);
            tempY += Math.Sin(theta) * radius * (start ? 1 : -1);

            return new Point(tempX, tempY);
        }

        #endregion
    }
}