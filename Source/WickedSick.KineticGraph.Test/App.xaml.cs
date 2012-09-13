using System.Windows;
using WickedSick.KineticGraph.Test.ViewModels;

namespace WickedSick.KineticGraph.Test
{
    public partial class App : Application
    {
        protected override void OnStartup(StartupEventArgs e)
        {
            var vm = new TestViewModel();
            vm.Load();
            var view = new MainWindow { DataContext = vm };
            view.Show();
        }
    }
}