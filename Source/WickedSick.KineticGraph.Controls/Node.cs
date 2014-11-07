using System;
using System.Diagnostics;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Shapes;

namespace WickedSick.KineticGraph.Controls
{
    public class Node : Canvas
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
            MouseLeftButtonDown += Node_MouseLeftButtonDown;
            MouseLeftButtonUp += Node_MouseLeftButtonUp;
            MouseMove += Node_MouseMove;
            LostMouseCapture += Node_LostMouseCapture;
        }

        internal Graph Graph { get; set; }

#if SILVERLIGHT
        public DependencyObject VisualParent
        {
            get { return VisualTreeHelper.GetParent(this); }
        }
#endif

        #region Dragging

        private Point _LastPos;
        private bool _IsDragging;
        private void Node_MouseLeftButtonDown(object sender, System.Windows.Input.MouseButtonEventArgs e)
        {
            if (e.Handled)
                return;
            e.Handled = PhysicalState.IsFrozen = _IsDragging = CaptureMouse();
            _LastPos = e.GetPosition(VisualParent as UIElement);
        }

        private void Node_MouseMove(object sender, System.Windows.Input.MouseEventArgs e)
        {
            if (_IsDragging)
            {
                var curPos = e.GetPosition(VisualParent as UIElement);
                var delta = new Point(curPos.X - _LastPos.X, curPos.Y - _LastPos.Y);
                PhysicalState.Position.X += delta.X;
                PhysicalState.Position.Y += delta.Y;
                _LastPos = curPos;
            }
        }

        private void Node_MouseLeftButtonUp(object sender, System.Windows.Input.MouseButtonEventArgs e)
        {
            ReleaseMouseCapture();
        }

        private void Node_LostMouseCapture(object sender, System.Windows.Input.MouseEventArgs e)
        {
            PhysicalState.IsFrozen = false;
            _IsDragging = false;
            OnManualMovement();
        }

        public event EventHandler ManualMovement;
        protected virtual void OnManualMovement()
        {
            var obj = ManualMovement;
            if (obj != null)
                obj(this, new EventArgs());
        }

        #endregion

        #region IsSelected Property

        public static readonly DependencyProperty IsSelectedProperty = DependencyProperty.Register(
            "IsSelected", typeof(bool), typeof(Node), new PropertyMetadata((d, args) => (d as Node).OnIsSelectedChanged(args)));

        public bool IsSelected
        {
            get { return (bool)GetValue(IsSelectedProperty); }
            set { SetValue(IsSelectedProperty, value); }
        }

        private void OnIsSelectedChanged(DependencyPropertyChangedEventArgs args)
        {
            if (args.OldValue == args.NewValue)
                return;
            if (args.NewValue is bool)
            {
                if ((bool)args.NewValue)
                {
                    Debug.WriteLine("Highlight me!");
                }
                else
                {
                    Debug.WriteLine("Unhighlight me!");
                }
            }

            if (Graph != null)
                Graph.SetCurrentValue(Graph.SelectedNodeProperty, this);
        }

        #endregion

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