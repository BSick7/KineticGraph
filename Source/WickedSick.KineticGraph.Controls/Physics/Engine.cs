using System;
using System.Collections.Generic;
using System.Linq;

namespace WickedSick.KineticGraph.Controls.Physics
{
    internal class Engine
    {
        private double _KE = double.PositiveInfinity;
        private const double KE_THRESHOLD = 0.001;
        //private const double CENTERING_THRESHOLD = 0.3;
        private bool _IsGraphDisturbed;
        private int _NumberOfIterations = 15;

        public bool IsGraphStabilized { get; protected set; }
        public double KineticEnergy { get { return _KE; } }
        public double AverageKineticEnergy { get { return _KE / _Nodes.Count; } }

        internal double Repulsion = 300.0;
        internal double SpringTension = 0.9 * 0.001;

        private IList<Node> _Nodes;
        private IList<Edge> _Edges;

        public void Attach(IList<Node> nodes, IList<Edge> edges)
        {
            _Nodes = nodes;
            _Edges = edges;
        }

        public void Step()
        {
            if (_Nodes == null)
                return;
            if (_Edges == null)
                return;

            if (KE_THRESHOLD <= AverageKineticEnergy)
            {
                if (IsGraphStabilized)
                {
                    IsGraphStabilized = false;
                    OnGraphStabilizing();
                }
                for (int i = 0; i < _NumberOfIterations; i++)
                {
                    _KE = ApplyForces();
                }
            }
            else if (_IsGraphDisturbed)
            {
                if (IsGraphStabilized)
                {
                    IsGraphStabilized = false;
                    OnGraphStabilizing();
                }
                _KE = ApplyForces();
                _IsGraphDisturbed = false;
            }
            else if (!IsGraphStabilized)
            {
                IsGraphStabilized = true;
                OnGraphStabilized();
            }
        }

        private double ApplyForces()
        {
            double totalKE = 0.0;
            const double dT = 0.95;
            const double damping = 0.90;

            for (int i = 0; i < _Nodes.Count; i++)
            {
                _Nodes[i].PhysicalState.Force.X = 0;
                _Nodes[i].PhysicalState.Force.Y = 0;
            }

            for (int i = 0; i < _Nodes.Count; i++)
            {
                var state = _Nodes[i].PhysicalState;
                if (state.IsFrozen)
                    continue;

                //Coulomb repulsion against every other node
                for (int j = i + 1; j < _Nodes.Count; j++)
                {
                    var other = _Nodes[j];
                    var otherState = other.PhysicalState;

                    /* Applies coulumb replusion to both nodes
                     * The repulsion constant is modified dynamically based on the node vertex degree.
                     * In a nutshell, lots of connected nodes --> more repulsion.
                     * Increasing repulsion initial value will increase separation of a cluster.
                     */
                    var repulsion = Repulsion * Math.Log(other.Degree + 2, 2);
                    ForceHelper.ApplyCoulombRepulsion(state, otherState, repulsion);
                }
            }
            
            //Hooke's attraction with every connected node
            for (int i = 0; i < _Edges.Count; i++)
            {
                var edge = _Edges[i];
                ForceHelper.ApplyHookeAttraction(edge.Source.PhysicalState, edge.Sink.PhysicalState, SpringTension);
            }

            var nodes = _Nodes.Where(n => n.PhysicalState.IsFrozen).ToList();
            for (int i = 0; i < _Nodes.Count; i++)
            {
                var state = _Nodes[i].PhysicalState;
                if (state.IsFrozen)
                    continue;
                // Update velocity
                state.Velocity.X = (state.Force.X * dT + state.Velocity.X) * damping;
                state.Velocity.Y = (state.Force.Y * dT + state.Velocity.Y) * damping;
                // Update KE
                totalKE += (state.Velocity.X * state.Velocity.X) + (state.Velocity.Y * state.Velocity.Y);
                // Update position
                double temp = state.Position.X + state.Velocity.X * dT;
                if (!double.IsNaN(temp))
                    state.Position.X = temp;
                temp = state.Position.Y + state.Velocity.Y * dT;
                if (!double.IsNaN(temp))
                    state.Position.Y = temp;
            }

            return totalKE;
        }

        public void Disturb()
        {
            _IsGraphDisturbed = true;
        }

        #region Graph Stabilization Events

        public event EventHandler GraphStabilizing;
        protected virtual void OnGraphStabilizing()
        {
            var obj = GraphStabilizing;
            if (obj != null)
                obj(this, new EventArgs());
        }

        public event EventHandler GraphStabilized;
        protected virtual void OnGraphStabilized()
        {
            var obj = GraphStabilized;
            if (obj != null)
                obj(this, new EventArgs());
        }

        #endregion
    }
}