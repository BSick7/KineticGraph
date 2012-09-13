using System.Windows;
using System.Windows.Controls;

namespace WickedSick.KineticGraph.Test.Silverlight
{
    public partial class MainPage : UserControl
    {
        public MainPage()
        {
            InitializeComponent();
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