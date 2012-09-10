using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Shapes;

namespace WickedSick.KineticGraph.Controls
{
    internal class Node : Canvas
    {
        internal ILinkable Linkable { get; set; }
        internal NodeState PhysicalState { get; set; }
        internal int Degree { get; set; }

        private Ellipse _Circle = new Ellipse
        {
            Width = 20,
            Height = 20,
            Fill = new SolidColorBrush(Color.FromArgb(128, 128, 128, 128)),
            Stroke = new SolidColorBrush(Color.FromArgb(255, 128, 128, 128)),
            StrokeThickness = 2.0,
        };

        public Node()
        {
            PhysicalState = new NodeState();
            Children.Add(_Circle);
        }

        public double Radius
        {
            get { return _Circle.Width / 2; }
            set
            {
                _Circle.Width = 2 * value;
                _Circle.Height = 2 * value;
            }
        }

        public void UpdatePosition()
        {
            Canvas.SetLeft(this, PhysicalState.Position.X - (_Circle.ActualWidth / 2));
            Canvas.SetTop(this, PhysicalState.Position.Y - (_Circle.ActualHeight / 2));
        }
    }
}