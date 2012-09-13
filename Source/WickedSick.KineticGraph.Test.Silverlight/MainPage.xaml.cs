using System.Windows.Controls;

namespace WickedSick.KineticGraph.Test.Silverlight
{
    public partial class MainPage : UserControl
    {
        public MainPage()
        {
            InitializeComponent();
        }

        private void Center_Click(object sender, System.Windows.RoutedEventArgs e)
        {
            Graph.Center();
        }
    }
}