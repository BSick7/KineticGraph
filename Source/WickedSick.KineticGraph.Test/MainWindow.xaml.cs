using System;
using System.Linq;
using System.Collections.Generic;
using System.Windows;

namespace WickedSick.KineticGraph.Test
{
    public partial class MainWindow : Window
    {
        private Random _Randomizer = new Random();

        public MainWindow()
        {
            InitializeComponent();
            var vm = new TestViewModel();
            DataContext = vm;

            var georgia = new TestNode();
            var florida = new TestNode();
            var sc = new TestNode();
            var tennesse = new TestNode();
            var nc = new TestNode();
            var alabama = new TestNode();

            vm.Nodes.Add(georgia);
            vm.Nodes.Add(florida);
            vm.Nodes.Add(sc);
            vm.Nodes.Add(tennesse);
            vm.Nodes.Add(nc);
            vm.Nodes.Add(alabama);

            vm.Edges.Add(georgia.Connect(florida));
            vm.Edges.Add(georgia.Connect(sc));
            vm.Edges.Add(georgia.Connect(nc));
            vm.Edges.Add(georgia.Connect(tennesse));
            vm.Edges.Add(georgia.Connect(alabama));

            vm.Edges.Add(alabama.Connect(tennesse));
            vm.Edges.Add(alabama.Connect(florida));

            vm.Edges.Add(nc.Connect(sc));

            vm.Edges.Add(nc.Connect(tennesse));
        }

        private void AddNode_Click(object sender, RoutedEventArgs e)
        {
            var vm = DataContext as TestViewModel;

            var newNode = new TestNode();
            vm.Nodes.Add(newNode);

            var newEdges = new List<TestEdge>();
            var randomCount = _Randomizer.Next(1, 4);
            for (int i = 0; i < randomCount; i++)
            {
                var existingNode = vm.Nodes[_Randomizer.Next(0, 3)];
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
                vm.Edges.Add(edge);
        }

        private void DecreaseSpring_Click(object sender, RoutedEventArgs e)
        {
            Graph.SpringTension -= 0.0001;
        }

        private void IncreaseSpring_Click(object sender, RoutedEventArgs e)
        {
            Graph.SpringTension += 0.0001;
        }

        private void DecreaseRepulsion_Click(object sender, RoutedEventArgs e)
        {
            Graph.Repulsion -= 10.0;
        }

        private void IncreaseRepulsion_Click(object sender, RoutedEventArgs e)
        {
            Graph.Repulsion += 10.0;
        }
    }
}