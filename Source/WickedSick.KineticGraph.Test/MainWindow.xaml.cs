using System.Windows;

namespace WickedSick.KineticGraph.Test
{
    public partial class MainWindow : Window
    {
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
    }
}