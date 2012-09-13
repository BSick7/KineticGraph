using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;

namespace WickedSick.KineticGraph.Test.ViewModels
{
    public class TestViewModel : ObservableObject
    {
        #region Properties

        private ObservableCollection<TestNode> _Nodes = new ObservableCollection<TestNode>();
        public ObservableCollection<TestNode> Nodes
        {
            get { return _Nodes; }
            set
            {
                _Nodes = value;
                OnPropertyChanged("Nodes");
            }
        }

        private ObservableCollection<TestEdge> _Edges = new ObservableCollection<TestEdge>();
        public ObservableCollection<TestEdge> Edges
        {
            get { return _Edges; }
            set
            {
                _Edges = value;
                OnPropertyChanged("Edges");
            }
        }

        private double _Repulsion;
        public double Repulsion
        {
            get { return _Repulsion; }
            set
            {
                _Repulsion = value;
                OnPropertyChanged("Repulsion");
            }
        }

        private double _SpringTension;
        public double SpringTension
        {
            get { return _SpringTension; }
            set
            {
                _SpringTension = value;
                OnPropertyChanged("SpringTension");
            }
        }

        #endregion

        #region AddNodeCommand

        private RelayCommand _AddNodeCommand;
        public RelayCommand AddNodeCommand
        {
            get
            {
                if (_AddNodeCommand == null)
                    _AddNodeCommand = new RelayCommand(AddNode_Execute);
                return _AddNodeCommand;
            }
        }

        private Random _Randomizer = new Random();
        private void AddNode_Execute()
        {
            var newNode = new TestNode();
            Nodes.Add(newNode);

            var newEdges = new List<TestEdge>();
            var randomCount = _Randomizer.Next(1, 4);
            for (int i = 0; i < randomCount; i++)
            {
                var existingNode = Nodes[_Randomizer.Next(0, 3)];
                if (newEdges.Any(te => te.Source.UniqueID == existingNode.UniqueID || te.Sink.UniqueID == existingNode.UniqueID))
                {
                    i--;
                    continue;
                }
                if (_Randomizer.Next(0, 2) == 1)
                    newEdges.Add(newNode.Connect(existingNode));
                else
                    newEdges.Add(existingNode.Connect(newNode));
            }

            foreach (var edge in newEdges)
                Edges.Add(edge);
        }

        #endregion

        public void Load()
        {
            var georgia = new TestNode();
            var florida = new TestNode();
            var sc = new TestNode();
            var tennesse = new TestNode();
            var nc = new TestNode();
            var alabama = new TestNode();

            Nodes.Add(georgia);
            Nodes.Add(florida);
            Nodes.Add(sc);
            Nodes.Add(tennesse);
            Nodes.Add(nc);
            Nodes.Add(alabama);

            Edges.Add(georgia.Connect(florida));
            Edges.Add(georgia.Connect(sc));
            Edges.Add(georgia.Connect(nc));
            Edges.Add(georgia.Connect(tennesse));
            Edges.Add(georgia.Connect(alabama));

            Edges.Add(alabama.Connect(tennesse));
            Edges.Add(alabama.Connect(florida));

            Edges.Add(nc.Connect(sc));

            Edges.Add(nc.Connect(tennesse));
        }
    }
}