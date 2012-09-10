using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Threading;
using WickedSick.KineticGraph.Controls.Physics;

namespace WickedSick.KineticGraph.Controls
{
    public class Graph : Canvas
    {
        private Random _Randomizer = new Random();

        private readonly Engine _Engine = new Engine();
        private const double MAX_FPS = 100;
        private const double MAX_MSPF = 1000 / MAX_FPS;

        private DispatcherTimer _Timer;

        public Graph()
        {
            _Engine.Attach(Nodes, Edges);

            _Timer = new DispatcherTimer();
            _Timer.Interval = TimeSpan.FromMilliseconds(20);
            _Timer.Tick += Tick;
            _Timer.Start();
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
                    RemoveNodes(e.OldItems.OfType<ILinkable>());
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
                    RemoveEdges(e.OldItems.OfType<IEdge>());
                    break;
                case NotifyCollectionChangedAction.Replace:
                    AddEdges(e.NewItems.OfType<IEdge>());
                    RemoveEdges(e.OldItems.OfType<IEdge>());
                    break;
            }
        }

        #endregion

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
            Nodes.Add(node);
            Children.Add(node);
            node.PhysicalState.Position = GetRandomPoint();
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
            Children.Remove(existing);
            Nodes.Remove(existing);
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
            Edges.Add(edge);
            Children.Add(edge);
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
            Children.Remove(existing);
            Edges.Remove(existing);
        }

        #endregion

        private Point GetRandomPoint()
        {
            return new Point(_Randomizer.Next(0, Convert.ToInt32(ActualWidth)), _Randomizer.Next(0, Convert.ToInt32(ActualHeight)));
        }
    }
}