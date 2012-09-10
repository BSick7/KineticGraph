using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using WickedSick.KineticGraph.Controls.Physics;

namespace WickedSick.KineticGraph.Controls
{
    public class Graph : Canvas
    {
        private readonly Engine _Engine = new Engine();

        public Graph()
        {
            _Engine.Attach(Nodes, Edges);
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
                kgc.OnNodesSourceChanged((IEnumerable<ILinkable>)args.NewValue, (IEnumerable<ILinkable>)args.OldValue);
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
                kgc.OnEdgesSourceChanged((IEnumerable<IEdge>)args.NewValue, (IEnumerable<IEdge>)args.OldValue);
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

        #region Node Management

        private void AddNodes(IEnumerable<ILinkable> newLinkables)
        {
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
            return node;
        }

        private void RemoveNodes(IEnumerable<ILinkable> oldLinkables)
        {
            foreach (var linkable in oldLinkables)
                RemoveNode(linkable);
        }
        private void RemoveNode(ILinkable oldLinkable)
        {
            var existing = Nodes.FirstOrDefault(n => n.Linkable.UniqueID == oldLinkable.UniqueID);
            if (existing == null)
                return;
            Nodes.Remove(existing);
        }

        #endregion

        #region Edge Management

        private void AddEdges(IEnumerable<IEdge> newEdges)
        {
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
            return edge;
        }

        private void RemoveEdges(IEnumerable<IEdge> oldEdges)
        {
            foreach (var ie in oldEdges)
                RemoveEdge(ie);
        }
        private void RemoveEdge(IEdge edge)
        {
            var existing = Edges.FirstOrDefault(e => e.Source.Linkable.UniqueID == edge.Source.UniqueID && e.Sink.Linkable.UniqueID == edge.Sink.UniqueID);
            if (existing == null)
                return;
            Edges.Remove(existing);
        }

        #endregion
    }
}