﻿using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Threading;
using WickedSick.KineticGraph.Controls.Physics;

namespace WickedSick.KineticGraph.Controls
{
    public class Graph : Grid
    {
        private Random _Randomizer = new Random();

        private readonly Engine _Engine = new Engine();
        private const double MAX_FPS = 100;
        private const double MAX_MSPF = 1000 / MAX_FPS;

        private DispatcherTimer _Timer;

        private Canvas _Surface;
        private ScaleTransform _CanvasScale;
        private TranslateTransform _CanvasTranslate;

        public Graph()
        {
            _Engine.Attach(Nodes, Edges);

            _Timer = new DispatcherTimer();
            _Timer.Interval = TimeSpan.FromMilliseconds(20);
            _Timer.Tick += Tick;
            _Timer.Start();

            _Surface = new Canvas();
            Children.Add(_Surface);
            ResetMovement();
            
            Background = new SolidColorBrush(Colors.Transparent);

            MouseLeftButtonDown += Graph_MouseLeftButtonDown;
            MouseLeftButtonUp += Graph_MouseLeftButtonUp;
            MouseMove += Graph_MouseMove;
            LostMouseCapture += Graph_LostMouseCapture;
        }

        #region Properties
        
        private ObservableCollection<Node> Nodes = new ObservableCollection<Node>();
        private ObservableCollection<Edge> Edges = new ObservableCollection<Edge>();

        #region NodesSourceProperty

        public static readonly DependencyProperty NodesSourceProperty = DependencyProperty.Register(
            "NodesSource", typeof(IEnumerable<ILinkable>), typeof(Graph), new PropertyMetadata(NodesSourcePropertyChanged));

        public IEnumerable<ILinkable> NodesSource
        {
            get { return (IEnumerable<ILinkable>)GetValue(NodesSourceProperty); }
            set { SetValue(NodesSourceProperty, value); }
        }

        private static void NodesSourcePropertyChanged(DependencyObject d, DependencyPropertyChangedEventArgs args)
        {
            var kgc = d as Graph;
            if (kgc != null)
                kgc.OnNodesSourceChanged((IEnumerable<ILinkable>)args.OldValue, (IEnumerable<ILinkable>)args.NewValue);
        }

        private void OnNodesSourceChanged(IEnumerable<ILinkable> oldEnumerable, IEnumerable<ILinkable> newEnumerable)
        {
            var oldNC = oldEnumerable as INotifyCollectionChanged;
            if (oldNC != null)
            {
                oldNC.CollectionChanged -= NodesSource_CollectionChanged;
            }
            RemoveNodes(oldEnumerable);

            var newNC = newEnumerable as INotifyCollectionChanged;
            AddNodes(newEnumerable);
            if (newNC != null)
            {
                newNC.CollectionChanged += NodesSource_CollectionChanged;
            }
        }

        private void NodesSource_CollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
        {
            switch (e.Action)
            {
                case NotifyCollectionChangedAction.Add:
                    AddNodes(e.NewItems.OfType<ILinkable>());
                    break;
                case NotifyCollectionChangedAction.Remove:
                    RemoveNodes(e.OldItems.OfType<ILinkable>());
                    break;
                case NotifyCollectionChangedAction.Reset:
                    ClearNodes();
                    break;
                case NotifyCollectionChangedAction.Replace:
                    AddNodes(e.NewItems.OfType<ILinkable>());
                    RemoveNodes(e.OldItems.OfType<ILinkable>());
                    break;
            }
        }

        #endregion

        #region EdgesSourceProperty

        public static readonly DependencyProperty EdgesSourceProperty = DependencyProperty.Register(
            "EdgesSource", typeof(IEnumerable<IEdge>), typeof(Graph), new PropertyMetadata(EdgesSourcePropertyChanged));

        public IEnumerable<IEdge> EdgesSource
        {
            get { return (IEnumerable<IEdge>)GetValue(EdgesSourceProperty); }
            set { SetValue(EdgesSourceProperty, value); }
        }

        private static void EdgesSourcePropertyChanged(DependencyObject d, DependencyPropertyChangedEventArgs args)
        {
            var kgc = d as Graph;
            if (kgc != null)
                kgc.OnEdgesSourceChanged((IEnumerable<IEdge>)args.OldValue, (IEnumerable<IEdge>)args.NewValue);
        }

        private void OnEdgesSourceChanged(IEnumerable<IEdge> oldEnumerable, IEnumerable<IEdge> newEnumerable)
        {
            var oldNC = oldEnumerable as INotifyCollectionChanged;
            if (oldNC != null)
            {
                oldNC.CollectionChanged -= EdgesSource_CollectionChanged;
            }
            RemoveEdges(oldEnumerable);

            var newNC = newEnumerable as INotifyCollectionChanged;
            AddEdges(newEnumerable);
            if (newNC != null)
            {
                newNC.CollectionChanged += EdgesSource_CollectionChanged;
            }

        }

        private void EdgesSource_CollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
        {
            switch (e.Action)
            {
                case NotifyCollectionChangedAction.Add:
                    AddEdges(e.NewItems.OfType<IEdge>());
                    break;
                case NotifyCollectionChangedAction.Remove:
                    RemoveEdges(e.OldItems.OfType<IEdge>());
                    break;
                case NotifyCollectionChangedAction.Reset:
                    ClearEdges();
                    break;
                case NotifyCollectionChangedAction.Replace:
                    AddEdges(e.NewItems.OfType<IEdge>());
                    RemoveEdges(e.OldItems.OfType<IEdge>());
                    break;
            }
        }

        #endregion

        #region RepulsionProperty

#if SILVERLIGHT
        protected const double MIN_ALLOWED_REPULSION = 10.0;

        public static readonly DependencyProperty RepulsionProperty = DependencyProperty.Register(
            "Repulsion", typeof(double), typeof(Graph), new PropertyMetadata(300.0, RepulsionPropertyChanged));
#else
        public static readonly DependencyProperty RepulsionProperty = DependencyProperty.Register(
            "Repulsion", typeof(double), typeof(Graph), new PropertyMetadata(300.0, RepulsionPropertyChanged, RepulsionCoercer));
        
        private static object RepulsionCoercer(DependencyObject d, object value)
        {
            var st = (double)value;
            return Math.Max(st, 10.0);
        }
#endif

        public double Repulsion
        {
            get { return (double)GetValue(RepulsionProperty); }
            set { SetValue(RepulsionProperty, value); }
        }

        private static void RepulsionPropertyChanged(DependencyObject d, DependencyPropertyChangedEventArgs args)
        {
            if (d is Graph)
                (d as Graph).RepulsionChanged((double)args.OldValue, (double)args.NewValue);
        }

        protected virtual void RepulsionChanged(double oldRepulsion, double newRepulsion)
        {
#if SILVERLIGHT
            if (newRepulsion < MIN_ALLOWED_REPULSION)
                throw new ArgumentOutOfRangeException("Repulsion");
#endif
            _Engine.Repulsion = newRepulsion;
            _Engine.Disturb();
        }

        #endregion

        #region SpringTensionProperty
#if SILVERLIGHT
        protected const double MIN_ALLOWED_SPRING_TENSION = 0.0001;

        public static readonly DependencyProperty SpringTensionProperty = DependencyProperty.Register(
            "SpringTension", typeof(double), typeof(Graph), new PropertyMetadata(0.0009, SpringTensionPropertyChanged));
#else
        public static readonly DependencyProperty SpringTensionProperty = DependencyProperty.Register(
            "SpringTension", typeof(double), typeof(Graph), new PropertyMetadata(0.0009, SpringTensionPropertyChanged, SpringTensionCoercer));

        private static object SpringTensionCoercer(DependencyObject d, object value)
        {
            var st = (double)value;
            return Math.Max(st, 0.0001);
        }
#endif

        public double SpringTension
        {
            get { return (double)GetValue(SpringTensionProperty); }
            set { SetValue(SpringTensionProperty, value); }
        }

        private static void SpringTensionPropertyChanged(DependencyObject d, DependencyPropertyChangedEventArgs args)
        {
            if (d is Graph)
                (d as Graph).SpringTensionChanged((double)args.OldValue, (double)args.NewValue);
        }

        protected virtual void SpringTensionChanged(double oldSpringTension, double newSpringTension)
        {
#if SILVERLIGHT
            if (newSpringTension < MIN_ALLOWED_SPRING_TENSION)
                throw new ArgumentOutOfRangeException("SpringTension");
#endif
            _Engine.SpringTension = newSpringTension;
            _Engine.Disturb();
        }

        #endregion

        #region SelectedNodeProperty

        public static readonly DependencyProperty SelectedNodeProperty = DependencyProperty.Register(
            "SelectedNode", typeof(Node), typeof(Graph), new PropertyMetadata((d, args) => (d as Graph).OnSelectedNodeChanged(args)));

        public Node SelectedNode
        {
            get { return (Node)GetValue(SelectedNodeProperty); }
            set { SetValue(SelectedNodeProperty, value); }
        }

        private void OnSelectedNodeChanged(DependencyPropertyChangedEventArgs args)
        {
            var oldNode = args.OldValue as Node;
            if (oldNode != null && oldNode.IsSelected)
                oldNode.SetCurrentValue(Node.IsSelectedProperty, false);
        }

        #endregion

        #endregion

        public void ResetMovement()
        {
            var tg = new TransformGroup();
            _CanvasScale = new ScaleTransform();
            tg.Children.Add(_CanvasScale);
            _CanvasTranslate = new TranslateTransform();
            tg.Children.Add(_CanvasTranslate);
            _Surface.RenderTransform = tg;
        }

        public void Center()
        {
            var nodes = Nodes.ToList();
            var count = nodes.Count;
            var totX = 0.0;
            var totY = 0.0;
            foreach (var node in nodes)
            {
                totX += node.PhysicalState.Position.X;
                totY += node.PhysicalState.Position.Y;
            }
            _CanvasTranslate.X = (ActualWidth / 2) - (totX / count);
            _CanvasTranslate.Y = (ActualHeight / 2) - (totY / count);
        }

        #region Dragging

        private Point _LastPos;
        private bool _IsDragging;
        private void Graph_MouseLeftButtonDown(object sender, System.Windows.Input.MouseButtonEventArgs e)
        {
            if (e.Handled)
                return;
            e.Handled = _IsDragging = CaptureMouse();
            _LastPos = e.GetPosition(this);
        }

        private void Graph_MouseMove(object sender, System.Windows.Input.MouseEventArgs e)
        {
            if (_IsDragging)
            {
                var curPos = e.GetPosition(this);
                var delta = new Point(curPos.X - _LastPos.X, curPos.Y - _LastPos.Y);
                _CanvasTranslate.X += delta.X;
                _CanvasTranslate.Y += delta.Y;
                _LastPos = curPos;
            }
        }

        private void Graph_MouseLeftButtonUp(object sender, System.Windows.Input.MouseButtonEventArgs e)
        {
            ReleaseMouseCapture();
        }

        private void Graph_LostMouseCapture(object sender, System.Windows.Input.MouseEventArgs e)
        {
            _IsDragging = false;
        }

        #endregion

        private void Tick(object sender, EventArgs e)
        {
            _Engine.Step();
            UpdateVisuals();
        }

        private DateTime _LastVisualTick = DateTime.MinValue;
        private void UpdateVisuals()
        {
            var now = DateTime.Now;
            if ((now - _LastVisualTick).TotalMilliseconds < MAX_MSPF)
                return;
            _LastVisualTick = now;

            foreach (var node in Nodes)
            {
                node.UpdatePosition();
            }

            foreach (var edge in Edges)
            {
                edge.UpdatePosition();
            }
        }

        #region Node Management

        private void AddNodes(IEnumerable<ILinkable> newLinkables)
        {
            if (newLinkables == null)
                return;
            foreach (var linkable in newLinkables.Where(l => !Nodes.Any(n => n.Linkable.UniqueID == l.UniqueID)))
            {
                FindOrAddNode(linkable);
            }
        }
        private Node FindOrAddNode(ILinkable linkable)
        {
            var existing = Nodes.FirstOrDefault(n => n.Linkable.UniqueID == linkable.UniqueID);
            if (existing != null)
                return existing;
            return AddNode(linkable);
        }
        private Node AddNode(ILinkable newLinkable)
        {
            var node = new Node { Linkable = newLinkable, };
            node.Graph = this;
            Nodes.Add(node);
            _Surface.Children.Add(node);
            node.ManualMovement += node_ManualMovement;
            node.PhysicalState.Position = GetRandomPoint();
            _Engine.Disturb();
            return node;
        }

        private void RemoveNodes(IEnumerable<ILinkable> oldLinkables)
        {
            if (oldLinkables == null)
                return;
            foreach (var linkable in oldLinkables)
                RemoveNode(linkable);
        }
        private void RemoveNode(ILinkable oldLinkable)
        {
            var existing = Nodes.FirstOrDefault(n => n.Linkable.UniqueID == oldLinkable.UniqueID);
            if (existing == null)
                return;
            existing.ManualMovement -= node_ManualMovement;
            existing.Graph = null;
            _Surface.Children.Remove(existing);
            Nodes.Remove(existing);
            _Engine.Disturb();
        }
        private void ClearNodes()
        {
            var nodes = Nodes.ToList();
            foreach (var node in nodes)
            {
                node.Graph = null;
                _Surface.Children.Remove(node);
                Nodes.Remove(node);
            }
            _Engine.Disturb();
        }

        private void node_ManualMovement(object sender, EventArgs e)
        {
            _Engine.Disturb();
        }

        #endregion

        #region Edge Management

        private void AddEdges(IEnumerable<IEdge> newEdges)
        {
            if (newEdges == null)
                return;
            foreach (var ie in newEdges)
                FindOrAddEdge(ie);
        }
        private Edge FindOrAddEdge(IEdge newEdge)
        {
            var existing = Edges.FirstOrDefault(e => e.Source.Linkable.UniqueID == newEdge.Source.UniqueID && e.Sink.Linkable.UniqueID == newEdge.Sink.UniqueID);
            if (existing != null)
                return existing;
            return AddEdge(newEdge);
        }
        private Edge AddEdge(IEdge newEdge)
        {
            var edge = new Edge { Source = FindOrAddNode(newEdge.Source), Sink = FindOrAddNode(newEdge.Sink), };
            if (edge.Source.Linkable.UniqueID == edge.Sink.Linkable.UniqueID)
                return null;
            Edges.Add(edge);
            _Surface.Children.Add(edge);
            _Engine.Disturb();
            return edge;
        }

        private void RemoveEdges(IEnumerable<IEdge> oldEdges)
        {
            if (oldEdges == null)
                return;
            foreach (var ie in oldEdges)
                RemoveEdge(ie);
        }
        private void RemoveEdge(IEdge edge)
        {
            var existing = Edges.FirstOrDefault(e => e.Source.Linkable.UniqueID == edge.Source.UniqueID && e.Sink.Linkable.UniqueID == edge.Sink.UniqueID);
            if (existing == null)
                return;
            _Surface.Children.Remove(existing);
            Edges.Remove(existing);
            _Engine.Disturb();
        }
        private void ClearEdges()
        {
            var edges = Edges.ToList();
            foreach (var edge in edges)
            {
                _Surface.Children.Remove(edge);
                Edges.Remove(edge);
            }
            _Engine.Disturb();
        }

        #endregion

        private Point GetRandomPoint()
        {
            var width = Convert.ToInt32(ActualWidth);
            if (width == 0)
                width = 100;

            var height = Convert.ToInt32(ActualHeight);
            if (height == 0)
                height = 100;

            return new Point(_Randomizer.Next(0, width), _Randomizer.Next(0, height));
        }
    }
}