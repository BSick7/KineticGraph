using System.Windows.Controls;
using WickedSick.KineticGraph.Controls;

namespace WickedSick.KineticGraph.Test.Silverlight
{
    public partial class MainPage : UserControl
    {
        public MainPage()
        {
            InitializeComponent();
            Graph.SetCurrentValue(Graph.NodesSourceProperty, "test");
        }

        private void Center_Click(object sender, System.Windows.RoutedEventArgs e)
        {
            Graph.Center();
        }
    }
}