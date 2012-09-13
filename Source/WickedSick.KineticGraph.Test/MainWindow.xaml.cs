using System;
using System.Windows;

namespace WickedSick.KineticGraph.Test
{
    public partial class MainWindow : Window
    {
        private Random _Randomizer = new Random();

        public MainWindow()
        {
            InitializeComponent();
        }

        private void Center_Click(object sender, System.Windows.RoutedEventArgs e)
        {
            Graph.Center();
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