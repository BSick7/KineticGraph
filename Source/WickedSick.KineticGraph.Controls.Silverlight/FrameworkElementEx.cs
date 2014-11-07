using System;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Ink;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;

namespace WickedSick.KineticGraph.Controls
{
    public static class FrameworkElementEx
    {
#if SILVERLIGHT
        public static void SetCurrentValue(this FrameworkElement fe, DependencyProperty dp, object value)
        {
        }
#endif
    }
}