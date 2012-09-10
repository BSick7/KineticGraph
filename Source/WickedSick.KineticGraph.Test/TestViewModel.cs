using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Text;

namespace WickedSick.KineticGraph.Test
{
    public class TestViewModel : INotifyPropertyChanged
    {
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

        #region INotifyPropertyChanged Members

        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged(string propertyName)
        {
            var obj = PropertyChanged;
            if (obj != null)
                obj(this, new PropertyChangedEventArgs(propertyName));
        }

        #endregion
    }
}