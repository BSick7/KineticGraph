﻿using System.ComponentModel;

namespace WickedSick.KineticGraph.Test.ViewModels
{
    public class ObservableObject : INotifyPropertyChanged
    {
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