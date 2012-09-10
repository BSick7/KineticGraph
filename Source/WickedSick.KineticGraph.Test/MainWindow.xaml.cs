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

        private void Grid_MouseLeftButtonDown_1(object sender, System.Windows.Input.MouseButtonEventArgs e)
        {
            var vm = DataContext as TestViewModel;

            var newNode = new TestNode();
            vm.Nodes.Add(newNode);

            var newEdges = new List<TestEdge>();
            var randomCount = _Randomizer.Next(1, vm.Nodes.Count);
            for (int i = 0; i < randomCount; i++)
            {
                var existingNode = vm.Nodes[ _Randomizer.Next(0, vm.Nodes.Count)];
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
    }
}